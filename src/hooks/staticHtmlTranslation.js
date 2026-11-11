import { useContext, useEffect, useState } from 'react';

import appJson from '../../app.json';
import { AppLanguagesContext } from '../AppLanguagesProvider';
import { getTextsLocale } from '../helpers/textsLocaleHelper';
import { NetworkContext } from '../NetworkProvider';
import { GET_PUBLIC_HTML_TRANSLATION } from '../queries/publicHtmlFiles';
import { ReactQueryClient } from '../ReactQueryClient';

const INITIAL_POLL_WINDOW_MS = 5000;
const POLL_WINDOW_MS = 45000;

const schedulePoll = (load, startedAt) => {
  const elapsed = Date.now() - startedAt;
  if (elapsed >= POLL_WINDOW_MS) return;

  const interval = elapsed < INITIAL_POLL_WINDOW_MS ? 1000 : 3000;
  return setTimeout(load, Math.min(interval, POLL_WINDOW_MS - elapsed));
};

export const useStaticHtmlTranslation = (name, file, fetchPolicy, skip) => {
  const original = file?.content;
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const online = isConnected && isMainserverUp && fetchPolicy !== 'cache-only';
  const locale = getTextsLocale();
  const languages = useContext(AppLanguagesContext);
  const enabled = !skip && locale !== 'de' && languages.includes(locale);
  const [ready, setReady] = useState(null);

  useEffect(() => {
    if (!name || typeof original !== 'string' || !original.trim() || !online || !enabled) return;

    let active = true;
    let timer;
    const startedAt = Date.now();

    const load = async () => {
      try {
        const client = await ReactQueryClient();
        const response = await client.rawRequest(
          GET_PUBLIC_HTML_TRANSLATION,
          { name, version: appJson.expo.version },
          { locale }
        );
        const scope = await client.cacheScope(undefined, locale);
        if (!active || scope !== response.scope || getTextsLocale() !== locale) return;

        const file = response.data?.publicHtmlFile;
        if (file?.content !== original || !file.translation) return;
        const { state, content } = file.translation;

        if (state === 'ready' && typeof content === 'string' && content.trim()) {
          setReady({ name, locale, original, content });
        } else if (state === 'pending') {
          timer = schedulePoll(load, startedAt);
        }
      } catch {
        // Keep showing the original when the translation lookup fails.
      }
    };

    void load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [name, original, online, enabled, locale]);

  return enabled && ready?.name === name && ready.locale === locale && ready.original === original
    ? ready.content
    : original;
};
