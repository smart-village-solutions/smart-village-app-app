import type {
  KlimaTalerOffer,
  KlimaTalerOfferLocation,
  KlimaTalerOffers,
  OffersEnvironment,
  OffersQuery
} from './offersTypes';

type OffersResponse = {
  status: number;
  headers: { get: (name: string) => string | null };
  json: () => Promise<unknown>;
};
type OffersFetch = (
  url: string,
  options: {
    headers: Record<string, string>;
    credentials: 'omit';
    redirect: 'error';
    signal: AbortSignal;
  }
) => Promise<OffersResponse>;

export class OffersError extends Error {
  constructor(
    public readonly code:
      | 'E_QUERY'
      | 'E_NETWORK'
      | 'E_TIMEOUT'
      | 'E_HTTP'
      | 'E_RESPONSE'
      | 'E_RATE_LIMIT',
    public readonly status?: number,
    public readonly retryAt?: number
  ) {
    super('Die Klima-Taler-Angebote konnten nicht geladen werden.');
    this.name = 'OffersError';
  }
}

const endpoints: Record<OffersEnvironment, string> = {
  stage: 'https://api.coin-stage.de/api/v1/map/offers',
  production: 'https://api.klima-taler.com/api/v1/map/offers'
};
const CACHE_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 15 * 1000;
const numberInRange = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const integer = (value: unknown, min = 0): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= min;
const text = (value: unknown): value is string => typeof value === 'string';
const nullableText = (value: unknown): value is string | null => value === null || text(value);
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const coordinates = (value: Record<string, unknown>) =>
  numberInRange(value.latitude, -90, 90) && numberInRange(value.longitude, -180, 180);
const image = (value: unknown) =>
  text(value) && (value === '' || /^https:\/\/[^\s]+$/i.test(value));

const isOffer = (value: unknown): value is KlimaTalerOffer =>
  object(value) &&
  integer(value.id, 1) &&
  text(value.title) &&
  integer(value.cost) &&
  integer(value.remaining, 1) &&
  [1, 2].includes(value.offer_type_id as number) &&
  (value.image === null || image(value.image)) &&
  value.deeplink === `https://open.klima-taler.com/offers/${value.id}`;

const isLocation = (value: unknown): value is KlimaTalerOfferLocation =>
  object(value) &&
  integer(value.id, 1) &&
  text(value.name) &&
  image(value.image) &&
  ['address', 'postal_code', 'city'].every((key) => nullableText(value[key])) &&
  ['type', 'icon_active', 'icon_inactive'].every((key) => text(value[key])) &&
  coordinates(value) &&
  numberInRange(value.distance_km, 0, Number.MAX_VALUE) &&
  Array.isArray(value.offers) &&
  value.offers.length > 0 &&
  value.offers.every(isOffer);

const parseOffers = (value: unknown): KlimaTalerOffers => {
  if (
    !object(value) ||
    !object(value.center) ||
    !coordinates(value.center) ||
    !numberInRange(value.radius_km, 0.5, 25) ||
    !integer(value.count) ||
    !Array.isArray(value.locations) ||
    value.count !== value.locations.length ||
    !value.locations.every(isLocation)
  )
    throw new OffersError('E_RESPONSE');
  return value as unknown as KlimaTalerOffers;
};

const requestURL = (environment: OffersEnvironment, query: OffersQuery) => {
  if (!Object.prototype.hasOwnProperty.call(endpoints, environment))
    throw new OffersError('E_QUERY');
  const { area, latitude, longitude, radius, language = 'de' } = query;
  const params: [string, string][] = [];
  if (area !== undefined) {
    if (!text(area) || !area.trim() || latitude !== undefined || longitude !== undefined)
      throw new OffersError('E_QUERY');
    params.push(['area', area]);
  } else {
    if (!coordinates({ latitude, longitude })) throw new OffersError('E_QUERY');
    params.push(['latitude', String(latitude)], ['longitude', String(longitude)]);
  }
  if (radius !== undefined) {
    if (!numberInRange(radius, 0.5, 25)) throw new OffersError('E_QUERY');
    params.push(['radius', String(radius)]);
  }
  if (!['de', 'en'].includes(language)) throw new OffersError('E_QUERY');
  const search = params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  return { url: `${endpoints[environment]}?${search}`, language };
};

// Public feed only: no SDK initialization, user session, credentials or tracking side effects.
// Supply expo/fetch when connecting this client to a screen.
export const createOffersClient = (fetcher: OffersFetch, now = Date.now) => {
  const cache = new Map<string, { expires: number; data: KlimaTalerOffers }>();
  const pending = new Map<string, Promise<KlimaTalerOffers>>();
  const cooldown = new Map<OffersEnvironment, number>();

  const request = async (environment: OffersEnvironment, url: string, language: string) => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new OffersError('E_TIMEOUT'));
        controller.abort();
      }, TIMEOUT_MS);
    });
    const load = async () => {
      const response = await fetcher(url, {
        headers: { Accept: 'application/json', 'Accept-Language': language },
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal
      });
      // A transport may finish after abort; it must not change a newer request's cooldown.
      if (controller.signal.aborted) throw new OffersError('E_TIMEOUT');
      if (response.status === 429) {
        const header = response.headers.get('Retry-After');
        const seconds = header !== null && /^\d+$/.test(header.trim()) ? Number(header) : NaN;
        const date = header && /^[A-Za-z]{3},/.test(header) ? Date.parse(header) : NaN;
        const deadline = now() + seconds * 1000;
        const retryAt = Number.isFinite(deadline)
          ? deadline
          : Number.isFinite(date)
          ? Math.max(now(), date)
          : now() + 60 * 1000;
        cooldown.set(environment, retryAt);
        throw new OffersError('E_RATE_LIMIT', 429, retryAt);
      }
      if (response.status !== 200) throw new OffersError('E_HTTP', response.status);
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new OffersError('E_RESPONSE');
      }
      return parseOffers(data);
    };
    try {
      return await Promise.race([load(), timeout]);
    } catch (error) {
      throw error instanceof OffersError ? error : new OffersError('E_NETWORK');
    } finally {
      clearTimeout(timer);
    }
  };

  return {
    load: async (environment: OffersEnvironment, query: OffersQuery): Promise<KlimaTalerOffers> => {
      const { url, language } = requestURL(environment, query);
      const key = `${url}|${language}`;
      const cached = cache.get(key);
      if (cached && cached.expires > now()) return cached.data;
      const retryAt = cooldown.get(environment);
      if (retryAt !== undefined && retryAt > now())
        throw new OffersError('E_RATE_LIMIT', 429, retryAt);
      const existing = pending.get(key);
      if (existing) return existing;
      const operation = request(environment, url, language)
        .then((data) => {
          if (cache.size >= 32) cache.delete(cache.keys().next().value!);
          cache.set(key, { data, expires: now() + CACHE_MS });
          return data;
        })
        .finally(() => pending.delete(key));
      pending.set(key, operation);
      return operation;
    }
  };
};
