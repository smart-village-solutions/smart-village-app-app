import { useContext, useEffect, useState } from 'react';

import appJson from '../../app.json';
import { AppLanguagesContext } from '../AppLanguagesProvider';
import { getTextsLocale } from '../helpers/textsLocaleHelper';
import { NetworkContext } from '../NetworkProvider';
import { GET_PUBLIC_HTML_TRANSLATION } from '../queries/publicHtmlFiles';
import { ReactQueryClient } from '../ReactQueryClient';

const RETRY_INTERVAL_MS = 1000;
const RETRY_WINDOW_MS = 5000;

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
    const deadline = Date.now() + RETRY_WINDOW_MS;

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
        const translation = file?.translation;
        if (file?.content !== original) return;

        if (
          translation?.state === 'ready' &&
          typeof translation.content === 'string' &&
          translation.content.trim()
        ) {
          setReady({ name, locale, original, content: translation.content });
        } else if (translation?.state === 'pending' && Date.now() < deadline) {
          timer = setTimeout(load, RETRY_INTERVAL_MS);
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
