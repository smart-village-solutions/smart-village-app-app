import { useFocusEffect } from 'expo-router/react-navigation';
import gql from 'graphql-tag';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import appJson from '../../app.json';
import { AppLanguagesContext } from '../AppLanguagesProvider';
import { getTextsLocale } from '../helpers/textsLocaleHelper';
import { ProfileContext } from '../ProfileProvider';
import { ReactQueryClient } from '../ReactQueryClient';

const QUERY = gql`
  query PublicJsonFileTranslations($name: String!, $version: String!) {
    publicJsonFile(name: $name, version: $version) {
      translations
    }
  }
`;

const EMPTY = [];

const homeSettingsPath =
  /^(sections\.(categoriesNews\.\d+\.(categoryTitle|categoryTitleDetail|categoryButton)|headlinePointsOfInterestAndTours|buttonPointsOfInterestAndTours|headlineEvents|buttonEvents)|homeScreenConfig\.\d+\.(title|buttonTitle|categoriesNews\.\d+\.(categoryTitle|categoryTitleDetail|categoryButton)))$/;
const tabNavigationPath =
  /^tabConfigs\.\d+\.(label|accessibilityLabel|params\.title|tabOptions\.(tabBarLabel|tabBarAccessibilityLabel)|stackConfig\.screenConfigs\.\d+\.initialParams\.title)$/;
const aboutPath =
  /^(headlineAbout|entries\.\d+\.(title|subtitle|overtitle|statustitle|accessibilityLabel|teaserTitle|statusLabel|params\.title))$/;

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

const applyTranslations = (settings, entries, allowedPath) =>
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

const useConfiguredTranslations = (settings, online, allowedPath, name) => {
  const locale = getTextsLocale();
  const translationEnabled = useContext(AppLanguagesContext).includes(locale) && locale !== 'de';
  const { currentUserData, isLoggedIn } = useContext(ProfileContext);
  const [snapshot, setSnapshot] = useState(null);

  const loadTranslations = useCallback(() => {
    if (!settings || !online || !translationEnabled) return;

    let active = true;
    let timer;
    const deadline = Date.now() + 5000;
    const load = async () => {
      try {
        const client = await ReactQueryClient();
        const response = await client.rawRequest(
          QUERY,
          { name, version: appJson.expo.version },
          { locale }
        );
        const scope = await client.cacheScope(undefined, locale);
        if (!active || scope !== response.scope || getTextsLocale() !== locale) return;

        const entries = response.data?.publicJsonFile?.translations;
        if (!Array.isArray(entries)) return;

        setSnapshot({ locale, settings, name, currentUserData, isLoggedIn, entries });
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
  }, [settings, online, name, locale, translationEnabled, currentUserData, isLoggedIn]);

  const entries =
    translationEnabled &&
    snapshot?.locale === locale &&
    snapshot?.settings === settings &&
    snapshot?.name === name &&
    snapshot?.currentUserData === currentUserData &&
    snapshot?.isLoggedIn === isLoggedIn
      ? snapshot.entries
      : EMPTY;
  const translated = useMemo(
    () => applyTranslations(settings, entries, allowedPath),
    [settings, entries, allowedPath]
  );
  return { loadTranslations, translated };
};

export const useHomeSettingsTranslations = (settings, online) => {
  const { loadTranslations, translated } = useConfiguredTranslations(
    settings,
    online,
    homeSettingsPath,
    'globalSettings'
  );
  useFocusEffect(loadTranslations);
  return translated;
};

export const useTabNavigationTranslations = (settings, online) => {
  const { loadTranslations, translated } = useConfiguredTranslations(
    settings,
    online,
    tabNavigationPath,
    'tabNavigation'
  );
  useEffect(loadTranslations, [loadTranslations]);
  return translated;
};

export const useAboutTranslations = (settings, online, name) => {
  const { loadTranslations, translated } = useConfiguredTranslations(
    settings,
    online,
    aboutPath,
    name
  );
  useFocusEffect(loadTranslations);
  return translated;
};
