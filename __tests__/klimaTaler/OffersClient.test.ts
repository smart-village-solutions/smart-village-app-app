import { createOffersClient } from '../../src/klimaTaler/createOffersClient';
import type { OffersEnvironment, OffersQuery } from '../../src/klimaTaler/offersTypes';

const offer = {
  id: 757,
  title: 'Kaffee',
  cost: 2,
  remaining: 50,
  offer_type_id: 2,
  image: null,
  deeplink: 'https://open.klima-taler.com/offers/757'
};
const location = {
  id: 264,
  name: 'Café',
  image: '',
  address: null,
  postal_code: null,
  city: 'Detmold',
  type: 'cafe',
  icon_active: 'cafe-active',
  icon_inactive: 'cafe-inactive',
  latitude: 51.9375,
  longitude: 8.879,
  distance_km: 0.06,
  offers: [offer]
};
const feed = {
  center: { latitude: 51.938, longitude: 8.879 },
  radius_km: 10,
  count: 2,
  locations: [location, { ...location, id: 265, latitude: 51.93759 }]
};
const response = (data: unknown = feed, status = 200, retryAfter: string | null = null) => ({
  status,
  headers: { get: jest.fn().mockReturnValue(retryAfter) },
  json: jest.fn().mockResolvedValue(data)
});
const setup = () => {
  let time = Date.UTC(2026, 0, 1);
  const fetcher = jest.fn().mockResolvedValue(response());
  const client = createOffersClient(fetcher, () => time);
  return { fetcher, client, advance: (ms: number) => (time += ms), now: () => time };
};

test('public request uses the selected environment and language without account headers or cookies', async () => {
  const { client, fetcher } = setup();
  await client.load('stage', { area: 'detmold' });
  await client.load('production', {
    latitude: 51.9375,
    longitude: 8.879,
    radius: 5,
    language: 'en'
  });
  expect(fetcher.mock.calls[0][0]).toBe('https://api.coin-stage.de/api/v1/map/offers?area=detmold');
  expect(fetcher.mock.calls[0][1]).toEqual({
    headers: { Accept: 'application/json', 'Accept-Language': 'de' },
    credentials: 'omit',
    redirect: 'error',
    signal: expect.any(AbortSignal)
  });
  expect(fetcher.mock.calls[1][0]).toBe(
    'https://api.klima-taler.com/api/v1/map/offers?latitude=51.9375&longitude=8.879&radius=5'
  );
  expect(fetcher.mock.calls[1][1].headers['Accept-Language']).toBe('en');
});

test('retains all offers per location, shared offer IDs, server coordinates and missing image values', async () => {
  const { client } = setup();
  const data = await client.load('stage', { area: 'detmold' });
  expect(data).toEqual(feed);
  expect(data.locations.map((item) => item.offers[0].id)).toEqual([757, 757]);
  expect(data.locations[0].image).toBe('');
  expect(data.locations[0].offers[0].image).toBeNull();
});

test('valid empty data is cached; cache expires after five minutes', async () => {
  const { client, fetcher, advance } = setup();
  const empty = { ...feed, count: 0, locations: [] };
  fetcher.mockResolvedValue(response(empty));
  expect(await client.load('stage', { area: 'detmold' })).toEqual(empty);
  advance(299999);
  await client.load('stage', { area: 'detmold' });
  expect(fetcher).toHaveBeenCalledTimes(1);
  advance(1);
  await client.load('stage', { area: 'detmold' });
  expect(fetcher).toHaveBeenCalledTimes(2);
});

test('coalesces concurrent reads but separates environment, language and search area', async () => {
  const { client, fetcher } = setup();
  await Promise.all([
    client.load('stage', { area: 'detmold' }),
    client.load('stage', { area: 'detmold' })
  ]);
  expect(fetcher).toHaveBeenCalledTimes(1);
  await client.load('production', { area: 'detmold' });
  await client.load('stage', { area: 'detmold', language: 'en' });
  await client.load('stage', { area: 'detmold', radius: 25 });
  expect(fetcher).toHaveBeenCalledTimes(4);
});

test.each([
  {},
  { area: 'detmold', latitude: 51, longitude: 8 },
  { latitude: 91, longitude: 8 },
  { latitude: 51 },
  { latitude: NaN, longitude: 8 },
  { area: '' },
  { area: 'detmold', radius: 0 },
  { area: 'detmold', radius: 26 },
  { area: 'detmold', language: 'fr' }
])('rejects invalid query before making a request: %p', async (query) => {
  const { client, fetcher } = setup();
  await expect(client.load('stage', query as OffersQuery)).rejects.toMatchObject({
    code: 'E_QUERY'
  });
  expect(fetcher).not.toHaveBeenCalled();
});

test('rejects an unknown environment rather than silently using production', async () => {
  const { client, fetcher } = setup();
  await expect(
    client.load('staging' as OffersEnvironment, { area: 'detmold' })
  ).rejects.toMatchObject({
    code: 'E_QUERY'
  });
  expect(fetcher).not.toHaveBeenCalled();
});

test.each([
  { ...feed, count: 9 },
  { ...feed, center: { latitude: 100, longitude: 8 } },
  { ...feed, locations: [{ ...location, offers: [] }], count: 1 },
  { ...feed, locations: [{ ...location, offers: [{ ...offer, remaining: 0 }] }], count: 1 },
  { ...feed, locations: [{ ...location, offers: [{ ...offer, cost: '2' }] }], count: 1 },
  {
    ...feed,
    locations: [
      { ...location, offers: [{ ...offer, deeplink: 'https://example.org/offers/757' }] }
    ],
    count: 1
  }
])('malformed data is an error, not an empty success', async (data) => {
  const { client, fetcher } = setup();
  fetcher.mockResolvedValueOnce(response(data));
  await expect(client.load('stage', { area: 'detmold' })).rejects.toMatchObject({
    code: 'E_RESPONSE'
  });
  expect(await client.load('stage', { area: 'detmold' })).toEqual(feed);
  expect(fetcher).toHaveBeenCalledTimes(2);
});

test('honors Retry-After across queries in the same environment without automatic retries', async () => {
  const { client, fetcher, advance, now } = setup();
  fetcher.mockResolvedValueOnce(response(null, 429, '120'));
  const retryAt = now() + 120000;
  await expect(client.load('stage', { area: 'detmold' })).rejects.toMatchObject({
    code: 'E_RATE_LIMIT',
    status: 429,
    retryAt
  });
  await expect(client.load('stage', { area: 'detmold', radius: 25 })).rejects.toMatchObject({
    retryAt
  });
  expect(fetcher).toHaveBeenCalledTimes(1);
  await client.load('production', { area: 'detmold' });
  advance(120000);
  await client.load('stage', { area: 'detmold' });
  expect(fetcher).toHaveBeenCalledTimes(3);
});

test.each(['date', 'missing', 'invalid'])('handles %s Retry-After headers', async (kind) => {
  const { client, fetcher, now } = setup();
  const retryAt = now() + 60000;
  const header =
    kind === 'date' ? new Date(retryAt).toUTCString() : kind === 'invalid' ? '-1' : null;
  fetcher.mockResolvedValue(response(null, 429, header));
  await expect(client.load('stage', { area: 'detmold' })).rejects.toMatchObject({ retryAt });
});

test('HTTP, invalid JSON and transport errors omit server bodies and underlying errors', async () => {
  const { client, fetcher } = setup();
  const failed = response({ private: 'server-detail' }, 422);
  fetcher.mockResolvedValueOnce(failed);
  await expect(client.load('stage', { area: 'detmold' })).rejects.toMatchObject({
    code: 'E_HTTP',
    status: 422
  });
  expect(failed.json).not.toHaveBeenCalled();
  fetcher.mockResolvedValueOnce({
    ...response(),
    json: () => Promise.reject(new Error('raw-body'))
  });
  await expect(client.load('stage', { area: 'detmold' })).rejects.toMatchObject({
    code: 'E_RESPONSE'
  });
  fetcher.mockRejectedValueOnce(new Error('private-transport-detail'));
  try {
    await client.load('stage', { area: 'detmold' });
    throw new Error('Expected network failure');
  } catch (error) {
    expect(error).toMatchObject({ code: 'E_NETWORK' });
    expect(String(error)).not.toContain('private-transport-detail');
    expect(error).not.toHaveProperty('cause');
  }
});

test('bounds a hanging request, aborts it and allows retry without caching a late response', async () => {
  jest.useFakeTimers();
  try {
    const { client, fetcher } = setup();
    let finish!: (value: ReturnType<typeof response>) => void;
    fetcher.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    const request = client.load('stage', { area: 'detmold' });
    const rejection = expect(request).rejects.toMatchObject({ code: 'E_TIMEOUT' });
    await jest.advanceTimersByTimeAsync(15000);
    await rejection;
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
    await client.load('stage', { area: 'detmold' });
    finish(response({ ...feed, count: 0, locations: [] }));
    await Promise.resolve();
    expect(await client.load('stage', { area: 'detmold' })).toEqual(feed);
    expect(fetcher).toHaveBeenCalledTimes(2);
  } finally {
    jest.useRealTimers();
  }
});
