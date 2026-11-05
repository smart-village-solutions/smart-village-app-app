import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';

import { getAppTranslation } from '../helpers/newsTranslationHelper';
import { ProfileContext } from '../ProfileProvider';
import { GET_NEWS_ITEMS } from '../queries/newsItems';
import { ReactQueryClient } from '../ReactQueryClient';

export const NEWS_TRANSLATION_READY = 'newsTranslationReady';

const readEntries = (response) =>
  (response?.data?.newsItems ?? []).flatMap((item, index) => {
    const metadata = getAppTranslation(response, ['newsItems', index], 'en');
    return item?.id && metadata ? [{ item, ...metadata }] : [];
  });

export const applyNewsListTitles = (data, titles) => {
  if (!data?.newsItems || !titles.size) return data;

  return {
    ...data,
    newsItems: data.newsItems.map((item) =>
      titles.has(item.id) ? { ...item, mainTitle: titles.get(item.id) } : item
    )
  };
};

export const useNewsListTranslations = (enabled, authMode) => {
  const { currentUserData, isLoggedIn } = useContext(ProfileContext);
  const memberId = currentUserData?.member?.id;
  const userId = currentUserData?.user?.id;
  const municipalityId =
    currentUserData?.member?.municipality_id ?? currentUserData?.user?.municipality_id;
  const [titles, setTitles] = useState(() => new Map());
  const observer = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const pending = new Map();
    const seen = new Map();
    let timer;
    let running = false;
    let active = true;

    const schedule = () => {
      if (!timer && !running && active && pending.size) timer = setTimeout(refresh, 1500);
    };
    const refresh = async () => {
      timer = undefined;
      running = true;
      const now = Date.now();
      const deadlines = new Map([...pending].filter(([, deadline]) => deadline > now));
      const ids = [...deadlines.keys()];
      const snapshots = new Map(ids.map((id) => [id, seen.get(id)]));
      pending.clear();
      if (!ids.length) {
        running = false;
        return;
      }

      try {
        const client = await ReactQueryClient();
        const response = await client.rawRequest(
          GET_NEWS_ITEMS,
          { ids, limit: ids.length },
          { authMode }
        );
        const scope = await client.cacheScope(authMode);
        if (!active || scope !== response.scope) return;

        const ready = readEntries(response).flatMap((entry) => {
          const { item, servedLocale, state } = entry;
          const deadline = deadlines.get(item.id);
          if (!deadline || seen.get(item.id) !== snapshots.get(item.id)) return [];
          if (state === 'pending' && deadline > Date.now() && !pending.has(item.id)) {
            pending.set(item.id, deadline);
          }
          seen.set(item.id, entry);
          const title = item.mainTitle || item.contentBlocks?.[0]?.title;
          return servedLocale === 'en' && title ? [[item.id, title]] : [];
        });
        if (ready.length) setTitles((previous) => new Map([...previous, ...ready]));
      } catch {
        // Keep the current rows when a background check fails.
      } finally {
        running = false;
        schedule();
      }
    };

    observer.current = (response) => {
      const entries = readEntries(response);
      if (!entries.length) return;

      setTitles((previous) => {
        const next = new Map(previous);
        entries.forEach(({ item }) => next.delete(item.id));
        return next.size === previous.size ? previous : next;
      });
      entries.forEach((entry) => {
        const { item, state } = entry;
        seen.set(item.id, entry);
        if (state === 'pending') pending.set(item.id, Date.now() + 5000);
        else pending.delete(item.id);
      });
      schedule();
    };
    const subscription = DeviceEventEmitter.addListener(
      NEWS_TRANSLATION_READY,
      ({ id, title, scope, sourceDigest }) => {
        const applyTitle = async () => {
          const client = await ReactQueryClient();
          const currentScope = await client.cacheScope(authMode);
          const observedDigest = seen.get(id)?.sourceDigest;
          if (
            !active ||
            scope !== currentScope ||
            (observedDigest && observedDigest !== sourceDigest)
          )
            return;

          pending.delete(id);
          // Discard any older list poll that was already in flight for this row.
          seen.set(id, { sourceDigest });
          setTitles((previous) =>
            previous.get(id) === title ? previous : new Map(previous).set(id, title)
          );
        };
        void applyTitle().catch(() => {});
      }
    );
    return () => {
      active = false;
      clearTimeout(timer);
      subscription.remove();
      observer.current = null;
      setTitles((previous) => (previous.size ? new Map() : previous));
    };
  }, [authMode, enabled, isLoggedIn, memberId, municipalityId, userId]);

  const observe = useCallback((response) => observer.current?.(response), []);
  return { observe, titles };
};
