import { useFocusEffect } from 'expo-router/react-navigation';
import gql from 'graphql-tag';
import { useCallback, useContext, useMemo, useState } from 'react';

import appJson from '../../app.json';
import { getTextsLocale } from '../helpers/textsLocaleHelper';
import { ProfileContext } from '../ProfileProvider';
import { ReactQueryClient } from '../ReactQueryClient';

const QUERY = gql`
  query HomeSettingsTranslations($version: String!) {
    homeSettingsTranslations(version: $version)
  }
`;

const EMPTY = [];

const allowedPath =
  /^(sections\.(categoriesNews\.\d+\.(categoryTitle|categoryTitleDetail|categoryButton)|headlinePointsOfInterestAndTours|buttonPointsOfInterestAndTours|headlineEvents|buttonEvents)|homeScreenConfig\.\d+\.(title|buttonTitle|categoriesNews\.\d+\.(categoryTitle|categoryTitleDetail|categoryButton)))$/;

const overlay = (source, [key, ...rest], original, text) => {
  if (!source || !Object.hasOwn(source, key)) return source;
  const current = source[key];
  const next = rest.length
    ? overlay(current, rest, original, text)
    : current === original
    ? text
    : current;
  if (next === current) return source;

  const copy = Array.isArray(source) ? [...source] : { ...source };
  copy[key] = next;
  return copy;
};

const applyHomeSettingsTranslations = (settings, entries) =>
  entries.reduce((result, entry) => {
    if (
      entry?.state !== 'ready' ||
      !Array.isArray(entry.path) ||
      !allowedPath.test(entry.path.join('.')) ||
      typeof entry.original !== 'string' ||
      typeof entry.text !== 'string' ||
      !entry.text.trim()
    ) {
      return result;
    }
    return overlay(result, entry.path, entry.original, entry.text);
  }, settings);

export const useHomeSettingsTranslations = (settings, online) => {
  const locale = getTextsLocale();
  const { currentUserData, isLoggedIn } = useContext(ProfileContext);
  const [snapshot, setSnapshot] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (!online || locale !== 'en') return;

      let active = true;
      let timer;
      const deadline = Date.now() + 5000;
      const load = async () => {
        try {
          const client = await ReactQueryClient();
          const response = await client.rawRequest(QUERY, { version: appJson.expo.version });
          const scope = await client.cacheScope();
          if (!active || scope !== response.scope || getTextsLocale() !== locale) return;

          const entries = response.data?.homeSettingsTranslations;
          if (!Array.isArray(entries)) return;

          setSnapshot({ settings, currentUserData, isLoggedIn, entries });
          if (entries.some((entry) => entry?.state === 'pending') && Date.now() < deadline) {
            timer = setTimeout(load, 1000);
          }
        } catch {
          // Older servers and failed requests leave the original settings usable.
        }
      };
      void load();

      return () => {
        active = false;
        clearTimeout(timer);
      };
    }, [settings, online, locale, currentUserData, isLoggedIn])
  );

  const entries =
    locale === 'en' &&
    snapshot?.settings === settings &&
    snapshot?.currentUserData === currentUserData &&
    snapshot?.isLoggedIn === isLoggedIn
      ? snapshot.entries
      : EMPTY;
  return useMemo(() => applyHomeSettingsTranslations(settings, entries), [settings, entries]);
};
