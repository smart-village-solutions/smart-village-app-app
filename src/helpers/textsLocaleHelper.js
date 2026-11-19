import { getLocales } from 'expo-localization';
import * as Updates from 'expo-updates';
import { DevSettings } from 'react-native';

import { setTextsLocale, texts, textsByLocale } from '../config/texts';

import { readAppTextCatalog, applyAppTextCatalog, refreshAppTextCatalog } from './appTextCatalog';
import { getMainServerConfig, getMainServerUrl } from './mainServerHelper';
import { storageHelper } from './storageHelper';

const localePattern = /^[a-z]{2,8}(?:-[A-Za-z0-9]{2,8})*$/;
export const isTextsLocale = (locale) =>
  typeof locale === 'string' && locale.length <= 32 && localePattern.test(locale);

let contentLocale;
let releasedLocales = ['de'];
let preference = 'system';
let deviceLocales = [];
let revision = 0;
let savingPreference = false;
let reloading = false;

const releaseScope = () =>
  JSON.stringify([getMainServerUrl(), getMainServerConfig().oAuthClientId]);
const validLocales = (locales) => Array.isArray(locales) && locales.every(isTextsLocale);

export const getTextsLocale = () =>
  contentLocale ??
  Object.keys(textsByLocale).find((locale) => textsByLocale[locale] === texts) ??
  'de';

export const getAvailableTextsLocales = () => releasedLocales;

export const getTextsLocalePreference = () => preference ?? 'system';

const preferredLocales = (available) => {
  if (preference !== 'system') return available.includes(preference) ? [preference, 'de'] : ['de'];

  return [
    ...deviceLocales.flatMap(({ languageTag, languageCode }) => {
      const match = available.find((locale) => locale.toLowerCase() === languageTag?.toLowerCase());
      return [match, available.find((locale) => locale === languageCode)].filter(Boolean);
    }),
    'de'
  ];
};

const hasCatalog = (locale, stored) =>
  locale === 'de' || !!stored || Object.hasOwn(textsByLocale, locale);

const refreshedCatalog = async (client, locale) => {
  const before = await readAppTextCatalog(locale);
  try {
    await refreshAppTextCatalog(client, locale, { reload: false });
  } catch {
    // A bundled or previously downloaded catalog is still usable offline.
  }
  const stored = await readAppTextCatalog(locale);
  return { stored, changed: before?.revision !== stored?.revision };
};

const availableCatalog = async (locales) => {
  for (const locale of [...new Set(locales)]) {
    const stored = await readAppTextCatalog(locale);
    if (hasCatalog(locale, stored)) return { locale, stored };
  }
  return { locale: 'de', stored: null };
};

const reloadTexts = async () => {
  if (reloading) return;
  reloading = true;
  try {
    if (__DEV__) DevSettings.reload();
    else await Updates.reloadAsync();
  } catch (error) {
    reloading = false;
    throw error;
  }
};

export const initializeTextsLocale = async () => {
  revision++;
  reloading = false;
  preference = null;
  deviceLocales = [];
  releasedLocales = ['de'];
  let available;
  try {
    const saved = await storageHelper.textsLocale();
    preference = isTextsLocale(saved) ? saved : 'system';
    deviceLocales = getLocales();
    const cached = await storageHelper.textsLocales(releaseScope());
    available = validLocales(cached) ? [...new Set(['de', ...cached])] : undefined;
    if (available) releasedLocales = available;
  } catch (error) {
    // Keep the saved preference intact if storage or the native locale reader is unavailable.
    console.warn('Unable to restore text locale', error);
  }
  const candidates =
    preference === null
      ? ['de']
      : preferredLocales(available ?? (preference === 'system' ? ['de'] : [preference, 'de']));
  const { locale, stored } = await availableCatalog(candidates);
  setTextsLocale(locale, stored && applyAppTextCatalog(stored));
  contentLocale = locale;
  return locale;
};

// Called only after a successful, validated server release response.
export const synchronizeTextsLocale = async (client, locales) => {
  if (!validLocales(locales) || preference === null || savingPreference) return;
  const currentRevision = ++revision;
  const current = () => currentRevision === revision && !savingPreference;
  const available = [...new Set(['de', ...locales])];
  releasedLocales = available;
  try {
    await storageHelper.setTextsLocales(releaseScope(), available);
  } catch {
    // Live releases remain usable if the offline snapshot cannot be saved.
  }
  for (const locale of [...new Set(preferredLocales(available))]) {
    if (!current()) return;
    const { stored, changed } = await refreshedCatalog(client, locale);
    if (!current()) return;
    if (!hasCatalog(locale, stored)) continue;
    if (locale !== getTextsLocale() || changed) await reloadTexts();
    return;
  }
};

export const saveTextsLocaleAndReload = async (locale) => {
  if (locale !== 'system' && !isTextsLocale(locale)) throw new Error('Invalid text locale');
  revision++;
  savingPreference = true;
  try {
    await storageHelper.setTextsLocale(locale);
    preference = locale;
    // A reload also refreshes labels captured when App modules were first loaded.
    await reloadTexts();
  } finally {
    savingPreference = false;
  }
};
