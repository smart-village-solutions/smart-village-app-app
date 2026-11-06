import AsyncStorage from '@react-native-async-storage/async-storage';

import { APOLLO_CACHE_PERSIST_KEY, createEndOfDayExpiringStorage } from './cacheHelper';
import { storageHelper } from './storageHelper';

const requests = new Map();

const original = { servedLocale: 'de', state: 'unavailable' };

const newsTranslation = (response, locale) =>
  getAppTranslation(response, ['newsItem'], locale) ||
  (response?.extensions?.appTranslations === undefined ? original : undefined);

export const getAppTranslation = (response, path, locale) => {
  const entries = response?.extensions?.appTranslations;
  if (!Array.isArray(entries)) return undefined;
  const matches = entries.filter((entry) => JSON.stringify(entry?.path) === JSON.stringify(path));
  if (matches.length !== 1) return undefined;
  const entry = matches[0];
  if (
    typeof entry.sourceDigest !== 'string' ||
    !/^[a-f0-9]{64}$/.test(entry.sourceDigest) ||
    (entry.servedLocale !== 'de' && entry.servedLocale !== locale) ||
    !['pending', 'ready', 'unavailable'].includes(entry.state) ||
    (entry.servedLocale === 'de' ? entry.state === 'ready' : entry.state !== 'ready')
  )
    return undefined;
  return entry;
};

const persistResponse = async (storage, cacheKey, response, metadata) => {
  try {
    await storage.setItem(
      cacheKey,
      JSON.stringify({
        data: response.data,
        extensions: metadata?.sourceDigest ? { appTranslations: [metadata] } : undefined
      })
    );
  } catch {
    // A storage failure must not prevent displaying the authorized response.
  }
};

// The opened view settles once; late requests cannot write either UI state or its cache.
export const loadTranslatedNews = async ({
  client,
  document,
  id,
  authMode,
  locale,
  online,
  isCurrent,
  deadline = Date.now() + 5000
}) => {
  let active = true;
  let fallback;
  let timeout;
  let retryTimeout;
  let finish;
  let cacheKey;
  const requestId = Symbol();
  const isActive = () =>
    active && isCurrent() && Date.now() < deadline && requests.get(cacheKey) === requestId;
  const result = new Promise((resolve) => {
    finish = resolve;
  });
  const settle = (value) => {
    if (!active) return;
    active = false;
    clearTimeout(timeout);
    clearTimeout(retryTimeout);
    if (requests.get(cacheKey) === requestId) requests.delete(cacheKey);
    finish(isCurrent() ? value : undefined);
  };
  timeout = setTimeout(() => settle(fallback), Math.max(0, deadline - Date.now()));

  const run = async () => {
    const scope = await client.cacheScope(authMode, locale);
    if (!active) return;
    cacheKey = `${APOLLO_CACHE_PERSIST_KEY}:news:${scope}:${encodeURIComponent(
      locale
    )}:${encodeURIComponent(id)}`;
    requests.set(cacheKey, requestId);
    const storage = createEndOfDayExpiringStorage(AsyncStorage, {
      cacheKey,
      getGlobalSettings: storageHelper.globalSettings
    });
    let cached;
    try {
      cached = JSON.parse(await storage.getItem(cacheKey));
    } catch {
      /* Keep recoverable data. */
    }
    if (!isActive()) return settle();
    if ((await client.cacheScope(authMode, locale)) !== scope) return settle();
    if (!isActive()) return settle();
    if (cached?.data?.newsItem?.id == id) {
      const metadata = newsTranslation(cached, locale);
      if (metadata) {
        fallback = {
          data: cached.data,
          servedLocale: metadata.servedLocale,
          scope,
          sourceDigest: metadata.sourceDigest,
          fromCache: true
        };
        if (!online) return settle(fallback);
      }
    }
    if (!online) return settle();

    const matchesScope = async (response) =>
      response.scope === scope && (await client.cacheScope(authMode, locale)) === scope;

    // An unverified translation must not be displayed as the German original.
    const readGerman = async (response) => {
      const germanScope = await client.cacheScope(authMode, 'de');
      if (!isActive()) return settle();
      const german = await client.rawRequest(document, { id }, { authMode, locale: 'de' });
      if (!(await matchesScope(response))) return settle({ denied: true });
      if (!isActive()) return settle();
      const metadata = newsTranslation(german, 'de');
      if (german.scope !== germanScope || german.data?.newsItem?.id != id || !metadata) {
        return settle({ denied: true });
      }
      await persistResponse(storage, cacheKey, german, metadata);
      return settle({ data: german.data, servedLocale: 'de' });
    };

    const read = async () => {
      try {
        const response = await client.rawRequest(document, { id }, { authMode, locale });
        if (!isActive()) return settle();
        if (!(await matchesScope(response))) return settle({ denied: true });
        if (!isActive()) return settle();
        if (response.data?.newsItem?.id != id) return settle({ denied: true });
        const metadata = newsTranslation(response, locale);
        if (!metadata) return await readGerman(response);
        const { servedLocale, sourceDigest } = metadata;
        const value = { data: response.data, servedLocale, scope, sourceDigest };
        // Persist data and its language/source metadata together, outside normalized entity caches.
        const persisted = persistResponse(storage, cacheKey, response, metadata);
        if (metadata.state === 'ready') return settle(value);
        fallback = value;
        await persisted;
        if (!isActive()) return settle();
        if (metadata.state !== 'pending') return settle(value);
        retryTimeout = setTimeout(() => {
          if (isActive()) void read();
        }, 500);
      } catch (error) {
        // GraphQL/HTTP rejection must not reveal an older cached resource.
        settle(error.response ? { denied: true } : fallback);
      }
    };
    await read();
  };
  void run().catch(() => settle());
  return result;
};
