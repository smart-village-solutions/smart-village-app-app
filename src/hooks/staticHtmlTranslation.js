import { useContext, useEffect, useState } from 'react';

import appJson from '../../app.json';
import { AppLanguagesContext, AppLanguagesLoadingContext } from '../AppLanguagesProvider';
import { getTextsLocale } from '../helpers/textsLocaleHelper';
import { NetworkContext } from '../NetworkProvider';
import { GET_PUBLIC_HTML_TRANSLATION } from '../queries/publicHtmlFiles';
import { ReactQueryClient } from '../ReactQueryClient';

const INITIAL_POLL_WINDOW_MS = 5000;
const POLL_WINDOW_MS = 10000;

const schedulePoll = (load, startedAt) => {
  const elapsed = Date.now() - startedAt;
  if (elapsed >= POLL_WINDOW_MS) return;

  const interval = elapsed < INITIAL_POLL_WINDOW_MS ? 1000 : 3000;
  return setTimeout(load, Math.min(interval, POLL_WINDOW_MS - elapsed));
};

const canTranslate = ({ name, original, locale, languages, languagesLoading, skip }) =>
  !skip &&
  !!name &&
  typeof original === 'string' &&
  !!original.trim() &&
  locale !== 'de' &&
  (languagesLoading || languages.includes(locale));

const getMatchingTranslation = (response, scope, original) => {
  const file = response.data?.publicHtmlFile;
  if (scope === response.scope && file?.content === original) return file.translation;
};

export const useStaticHtmlTranslation = (name, file, fetchPolicy, skip) => {
  const original = file?.content;
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const online = isConnected && isMainserverUp && fetchPolicy !== 'cache-only';
  const locale = getTextsLocale();
  const languages = useContext(AppLanguagesContext);
  const languagesLoading = useContext(AppLanguagesLoadingContext);
  const [result, setResult] = useState(null);
  const eligible = canTranslate({ name, original, locale, languages, languagesLoading, skip });
  const settled =
    !!result && result.name === name && result.locale === locale && result.original === original;

  useEffect(() => {
    if (!eligible || settled) return;

    let active = true;
    let timer;
    const startedAt = Date.now();

    const settle = (content = original) => {
      if (!active) return;
      active = false;
      clearTimeout(timer);
      clearTimeout(deadline);
      setResult({ name, locale, original, content });
    };
    const deadline = setTimeout(settle, POLL_WINDOW_MS);

    if (!online) {
      settle();
      return;
    }

    const load = async () => {
      try {
        const client = await ReactQueryClient();
        if (!active) return;
        const response = await client.rawRequest(
          GET_PUBLIC_HTML_TRANSLATION,
          { name, version: appJson.expo.version },
          { locale }
        );
        const scope = await client.cacheScope(undefined, locale);
        if (!active || getTextsLocale() !== locale) return;

        const { state, content } = getMatchingTranslation(response, scope, original) ?? {};

        if (state === 'ready' && typeof content === 'string' && content.trim()) {
          settle(content);
        } else if (state === 'pending') {
          timer = schedulePoll(load, startedAt);
        } else {
          settle();
        }
      } catch {
        settle();
      }
    };

    void load();
    return () => {
      active = false;
      clearTimeout(timer);
      clearTimeout(deadline);
    };
  }, [name, original, online, eligible, locale, settled]);

  const loading = eligible && online && !settled;
  return {
    content: loading ? undefined : eligible && settled ? result.content : original,
    loading
  };
};
