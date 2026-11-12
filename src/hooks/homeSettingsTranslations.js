import { useFocusEffect } from 'expo-router/react-navigation';
import gql from 'graphql-tag';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import appJson from '../../app.json';
import { AppLanguagesContext, AppLanguagesLoadingContext } from '../AppLanguagesProvider';
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
const registrationPath = /^(headline|title|description|subQuery\.(buttons\.\d+\.)?buttonTitle)$/;
const registrationNavigationPath = /^\d+\.params\.title$/;

const isReadyLabel = (entry, allowedPath) =>
  entry?.state === 'ready' &&
  Array.isArray(entry.path) &&
  allowedPath.test(entry.path.join('.')) &&
  typeof entry.original === 'string' &&
  typeof entry.text === 'string' &&
  !!entry.text.trim();

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
    if (!isReadyLabel(entry, allowedPath)) return result;
    return overlay(result, entry.path, entry.original, entry.text);
  }, settings);

const matchingSnapshot = (snapshot, scope) =>
  snapshot && Object.keys(scope).every((key) => snapshot[key] === scope[key]) ? snapshot : null;

const useConfiguredTranslations = (settings, online, name, waitForTranslation = false) => {
  const locale = getTextsLocale();
  const languages = useContext(AppLanguagesContext);
  const languagesLoading = useContext(AppLanguagesLoadingContext);
  const translationEnabled =
    locale !== 'de' && (languages.includes(locale) || (waitForTranslation && languagesLoading));
  const { currentUserData, isLoggedIn } = useContext(ProfileContext);
  const [snapshot, setSnapshot] = useState(null);

  const loadTranslations = useCallback(() => {
    if (!settings || !online || !translationEnabled) return;

    let active = true;
    let timer;
    let entries = EMPTY;
    const timeout = waitForTranslation ? 10000 : 5000;
    const deadline = Date.now() + timeout;
    const save = (finished) =>
      setSnapshot({ locale, settings, name, currentUserData, isLoggedIn, entries, finished });
    const finish = () => {
      active = false;
      clearTimeout(timer);
      clearTimeout(deadlineTimer);
      save(true);
    };
    const deadlineTimer = waitForTranslation ? setTimeout(finish, timeout) : undefined;
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

        const labels = response.data?.publicJsonFile?.translations;
        if (!Array.isArray(labels)) {
          if (waitForTranslation) finish();
          return;
        }

        entries = labels;
        if (entries.some((entry) => entry?.state === 'pending') && Date.now() < deadline) {
          save(false);
          timer = setTimeout(load, 1000);
        } else {
          finish();
        }
      } catch {
        if (active && waitForTranslation) finish();
      }
    };
    void load();

    return () => {
      active = false;
      clearTimeout(timer);
      clearTimeout(deadlineTimer);
    };
  }, [
    settings,
    online,
    name,
    locale,
    translationEnabled,
    currentUserData,
    isLoggedIn,
    waitForTranslation
  ]);

  const current = translationEnabled
    ? matchingSnapshot(snapshot, { locale, settings, name, currentUserData, isLoggedIn })
    : null;
  return {
    loadTranslations,
    entries: current?.entries ?? EMPTY,
    loading: !!(
      settings &&
      online &&
      translationEnabled &&
      waitForTranslation &&
      !current?.finished
    )
  };
};

export const useHomeSettingsTranslations = (settings, online) => {
  const { loadTranslations, entries } = useConfiguredTranslations(
    settings,
    online,
    'globalSettings'
  );
  useFocusEffect(loadTranslations);
  return useMemo(() => applyTranslations(settings, entries, homeSettingsPath), [settings, entries]);
};

export const useTabNavigationTranslations = (settings, online) => {
  const { loadTranslations, entries } = useConfiguredTranslations(
    settings,
    online,
    'tabNavigation'
  );
  useEffect(loadTranslations, [loadTranslations]);
  return useMemo(
    () => applyTranslations(settings, entries, tabNavigationPath),
    [settings, entries]
  );
};

export const useAboutTranslations = (settings, online, name) => {
  const { loadTranslations, entries } = useConfiguredTranslations(settings, online, name);
  useFocusEffect(loadTranslations);
  return useMemo(() => applyTranslations(settings, entries, aboutPath), [settings, entries]);
};

export const useRegistrationTranslations = (settings, online, name, sourceName, screenTitle) => {
  const content = useConfiguredTranslations(settings, online, name, true);
  const navigation = useConfiguredTranslations(sourceName && screenTitle, online, sourceName, true);
  useFocusEffect(content.loadTranslations);
  useFocusEffect(navigation.loadTranslations);

  const data = useMemo(
    () => applyTranslations(settings, content.entries, registrationPath),
    [settings, content.entries]
  );
  const title = navigation.entries.find(
    (entry) => isReadyLabel(entry, registrationNavigationPath) && entry.original === screenTitle
  )?.text;
  return {
    data,
    title: navigation.loading ? '' : title ?? screenTitle,
    loading: content.loading || navigation.loading
  };
};
