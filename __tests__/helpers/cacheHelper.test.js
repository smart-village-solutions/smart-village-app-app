import {
  APOLLO_CACHE_PERSIST_KEY,
  CACHE_SCOPES,
  createEndOfDayExpiringStorage,
  millisecondsUntilCacheExpires
} from '../../src/helpers/cacheHelper';

describe('cacheHelper', () => {
  const expiresAtKey = `${APOLLO_CACHE_PERSIST_KEY}:expires-at`;

  const createStorage = (initialValues = {}) => {
    const values = new Map(Object.entries(initialValues));

    return {
      getItem: jest.fn(async (key) => values.get(key) ?? null),
      setItem: jest.fn(async (key, value) => {
        values.set(key, value);
      }),
      removeItem: jest.fn(async (key) => {
        values.delete(key);
      })
    };
  };

  it('returns persisted cache while its end-of-day expiration is valid', async () => {
    const storage = createStorage({
      [APOLLO_CACHE_PERSIST_KEY]: 'cache-data',
      [expiresAtKey]: `${Date.now() + 1000}`
    });
    const expiringStorage = createEndOfDayExpiringStorage(storage);

    await expect(expiringStorage.getItem(APOLLO_CACHE_PERSIST_KEY)).resolves.toBe('cache-data');
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it('purges persisted cache when expiration metadata is missing', async () => {
    const storage = createStorage({
      [APOLLO_CACHE_PERSIST_KEY]: 'cache-data'
    });
    const expiringStorage = createEndOfDayExpiringStorage(storage);

    await expect(expiringStorage.getItem(APOLLO_CACHE_PERSIST_KEY)).resolves.toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith(APOLLO_CACHE_PERSIST_KEY);
    expect(storage.removeItem).toHaveBeenCalledWith(expiresAtKey);
  });

  it('purges persisted cache when it is expired', async () => {
    const storage = createStorage({
      [APOLLO_CACHE_PERSIST_KEY]: 'cache-data',
      [expiresAtKey]: `${Date.now() - 1}`
    });
    const expiringStorage = createEndOfDayExpiringStorage(storage);

    await expect(expiringStorage.getItem(APOLLO_CACHE_PERSIST_KEY)).resolves.toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith(APOLLO_CACHE_PERSIST_KEY);
    expect(storage.removeItem).toHaveBeenCalledWith(expiresAtKey);
  });

  it('writes expiration metadata when Apollo cache is persisted', async () => {
    const storage = createStorage();
    const expiringStorage = createEndOfDayExpiringStorage(storage);

    await expiringStorage.setItem(APOLLO_CACHE_PERSIST_KEY, 'cache-data');

    expect(storage.setItem).toHaveBeenCalledWith(APOLLO_CACHE_PERSIST_KEY, 'cache-data');
    expect(storage.setItem).toHaveBeenCalledWith(expiresAtKey, expect.any(String));
  });

  it('uses configured cache hours from general settings', () => {
    expect(
      millisecondsUntilCacheExpires({
        settings: {
          cache: {
            general: 6
          }
        }
      })
    ).toBe(6 * 60 * 60 * 1000);
  });

  it('uses configured cache hours from scoped settings', () => {
    expect(
      millisecondsUntilCacheExpires(
        {
          settings: {
            cache: {
              general: 6,
              sue: 14
            }
          }
        },
        CACHE_SCOPES.SUE
      )
    ).toBe(14 * 60 * 60 * 1000);
  });

  it('falls back to general settings when scoped settings are missing', () => {
    expect(
      millisecondsUntilCacheExpires(
        {
          settings: {
            cache: {
              general: 6
            }
          }
        },
        CACHE_SCOPES.SUE
      )
    ).toBe(6 * 60 * 60 * 1000);
  });

  it('falls back to general settings when scoped settings are invalid', () => {
    expect(
      millisecondsUntilCacheExpires(
        {
          settings: {
            cache: {
              general: 6,
              sue: -1
            }
          }
        },
        CACHE_SCOPES.SUE
      )
    ).toBe(6 * 60 * 60 * 1000);
  });

  it('supports zero cache hours', () => {
    expect(
      millisecondsUntilCacheExpires({
        settings: {
          cache: {
            general: 0
          }
        }
      })
    ).toBe(0);
  });

  it('supports moment-style end-of-day settings', () => {
    const milliseconds = millisecondsUntilCacheExpires({
      settings: {
        cache: {
          general: 'endDay'
        }
      }
    });

    expect(milliseconds).toBeGreaterThanOrEqual(0);
    expect(milliseconds).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });
});
