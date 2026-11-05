import * as Updates from 'expo-updates';
import { DevSettings } from 'react-native';

import { setTextsLocale, texts, textsByLocale } from '../config/texts';

import { storageHelper } from './storageHelper';

export const getTextsLocale = () =>
  Object.keys(textsByLocale).find((locale) => textsByLocale[locale] === texts) || 'de';

export const initializeTextsLocale = async () => {
  let locale;
  try {
    locale = await storageHelper.textsLocale();
  } catch (error) {
    // Keep the saved preference intact if storage is temporarily unavailable.
    console.warn('Unable to restore text locale', error);
  }
  return setTextsLocale(locale);
};

export const saveTextsLocaleAndReload = async (locale) => {
  await storageHelper.setTextsLocale(locale);
  // A reload also refreshes labels captured when App modules were first loaded.
  if (__DEV__) DevSettings.reload();
  else await Updates.reloadAsync();
};
