import moment from 'moment';

export const APOLLO_CACHE_PERSIST_KEY = 'apollo-cache-persist';

// Cache scopes map globalSettings.settings.cache entries to the app areas they control.
// general: default React Query cache and fallback for every missing scope.
// apollo: persisted Apollo GraphQL cache restored from AsyncStorage.
// home: React Query cache for HomeSection data-driven sections.
// sue: React Query cache for SUE request list data.
export const CACHE_SCOPES = {
  APOLLO: 'apollo',
  GENERAL: 'general',
  HOME: 'home',
  SUE: 'sue'
};

const expiresAtKeyFor = (key) => `${key}:expires-at`;
const HOURS_TO_MILLISECONDS = 60 * 60 * 1000;

export const millisecondsUntilEndOfDay = () =>
  Math.max(moment().endOf('day').diff(moment(), 'milliseconds'), 0);

const normalizeMomentEndOfUnit = (value) => {
  const normalizedValue = value.replace(/[\s_-]/g, '').toLowerCase();
  const endOfMatch = normalizedValue.match(/^endof['"]?\(?['"]?([a-z]+)['"]?\)?$/);
  const endMatch = normalizedValue.match(/^end([a-z]+)$/);
  const unit = endOfMatch?.[1] ?? endMatch?.[1];

  if (!unit) {
    return undefined;
  }

  const units = {
    date: 'day',
    day: 'day',
    hour: 'hour',
    isoWeek: 'isoWeek',
    isoweek: 'isoWeek',
    month: 'month',
    quarter: 'quarter',
    week: 'week',
    year: 'year'
  };

  return units[unit];
};

const cacheConfigValueInMilliseconds = (cacheConfig) => {
  if (typeof cacheConfig === 'number') {
    return Number.isFinite(cacheConfig) && cacheConfig >= 0
      ? cacheConfig * HOURS_TO_MILLISECONDS
      : undefined;
  }

  if (typeof cacheConfig !== 'string') {
    return undefined;
  }

  const momentEndOfUnit = normalizeMomentEndOfUnit(cacheConfig);

  if (!momentEndOfUnit) {
    return undefined;
  }

  return Math.max(moment().endOf(momentEndOfUnit).diff(moment(), 'milliseconds'), 0);
};

const configuredCacheMaxAgeInMilliseconds = (globalSettings, cacheScope = CACHE_SCOPES.GENERAL) => {
  const cacheConfig = globalSettings?.settings?.cache;

  if (!cacheConfig) {
    return undefined;
  }

  const scopedCacheMaxAge = cacheConfigValueInMilliseconds(cacheConfig[cacheScope]);

  if (scopedCacheMaxAge !== undefined || cacheScope === CACHE_SCOPES.GENERAL) {
    return scopedCacheMaxAge;
  }

  // Scope-specific values override general; invalid or missing scopes fall back to general.
  return cacheConfigValueInMilliseconds(cacheConfig[CACHE_SCOPES.GENERAL]);
};

export const millisecondsUntilCacheExpires = (globalSettings, cacheScope = CACHE_SCOPES.GENERAL) =>
  configuredCacheMaxAgeInMilliseconds(globalSettings, cacheScope) ?? millisecondsUntilEndOfDay();

export const endOfDayTimestamp = () => moment().endOf('day').valueOf();

export const endOfDayUnix = () => moment().endOf('day').unix();

export const cacheExpiresAtTimestamp = (globalSettings, cacheScope = CACHE_SCOPES.GENERAL) => {
  const configuredCacheMaxAge = configuredCacheMaxAgeInMilliseconds(globalSettings, cacheScope);

  if (configuredCacheMaxAge === undefined) {
    return endOfDayTimestamp();
  }

  return Date.now() + configuredCacheMaxAge;
};

export const createEndOfDayExpiringStorage = (
  storage,
  { cacheKey = APOLLO_CACHE_PERSIST_KEY, cacheScope = CACHE_SCOPES.APOLLO, getGlobalSettings } = {}
) => {
  const expiresAtKey = expiresAtKeyFor(cacheKey);

  const purgeCache = async () => {
    await storage.removeItem(cacheKey);
    await storage.removeItem(expiresAtKey);
  };

  return {
    ...storage,
    getItem: async (key) => {
      if (key !== cacheKey) {
        return storage.getItem(key);
      }

      const expiresAt = Number(await storage.getItem(expiresAtKey));

      if (!expiresAt || Date.now() >= expiresAt) {
        await purgeCache();

        return null;
      }

      return storage.getItem(key);
    },
    setItem: async (key, value) => {
      await storage.setItem(key, value);

      if (key === cacheKey) {
        const globalSettings = await getGlobalSettings?.();

        await storage.setItem(
          expiresAtKey,
          `${cacheExpiresAtTimestamp(globalSettings, cacheScope)}`
        );
      }
    },
    removeItem: async (key) => {
      await storage.removeItem(key);

      if (key === cacheKey) {
        await storage.removeItem(expiresAtKey);
      }
    }
  };
};
