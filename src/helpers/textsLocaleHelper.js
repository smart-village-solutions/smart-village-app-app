import * as Updates from 'expo-updates';
import { DevSettings } from 'react-native';

import { setTextsLocale, texts, textsByLocale } from '../config/texts';

import { readAppTextCatalog, applyAppTextCatalog } from './appTextCatalog';
import { storageHelper } from './storageHelper';

const localePattern = /^[a-z]{2,8}(?:-[A-Za-z0-9]{2,8})*$/;
export const isTextsLocale = (locale) =>
  typeof locale === 'string' && locale.length <= 32 && localePattern.test(locale);

let contentLocale;

export const getTextsLocale = () =>
  contentLocale ??
  Object.keys(textsByLocale).find((locale) => textsByLocale[locale] === texts) ??
  'de';

export const initializeTextsLocale = async () => {
  let locale;
  try {
    locale = await storageHelper.textsLocale();
  } catch (error) {
    // Keep the saved preference intact if storage is temporarily unavailable.
    console.warn('Unable to restore text locale', error);
  }
  const preferred = isTextsLocale(locale) ? locale : 'de';
  const stored = await readAppTextCatalog(preferred);
  const catalogLocale = setTextsLocale(preferred, stored && applyAppTextCatalog(stored));
  contentLocale = preferred === catalogLocale ? undefined : preferred;
  return preferred;
};

export const saveTextsLocaleAndReload = async (locale) => {
  await storageHelper.setTextsLocale(locale);
  // A reload also refreshes labels captured when App modules were first loaded.
  if (__DEV__) DevSettings.reload();
  else await Updates.reloadAsync();
};
