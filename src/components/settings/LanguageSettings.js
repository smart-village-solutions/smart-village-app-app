import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { AppLanguageNamesContext, AppLanguagesContext } from '../../AppLanguagesProvider';
import { texts } from '../../config/texts';
import { getTextsLocale, saveTextsLocaleAndReload } from '../../helpers/textsLocaleHelper';
import { WrapperHorizontal } from '../Wrapper';

import { SettingsRadioGroup } from './SettingsRadioGroup';

const languageLabel = (locale) =>
  typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames([locale], { type: 'language' }).of(locale)
    : locale;

export const LanguageSettings = () => {
  const locales = useContext(AppLanguagesContext);
  const names = useContext(AppLanguageNamesContext);
  const latestLocales = useRef(locales);
  useLayoutEffect(() => {
    latestLocales.current = locales;
  }, [locales]);
  const locale = getTextsLocale();
  const [changingLocale, setChangingLocale] = useState(false);

  const changeLanguage = async (language) => {
    if (!latestLocales.current.includes(language)) return;
    setChangingLocale(true);
    try {
      await saveTextsLocaleAndReload(language);
    } catch (error) {
      console.warn('Unable to apply text locale', error);
      Alert.alert(texts.settingsTitles.language, texts.settingsContents.language.error);
    } finally {
      setChangingLocale(false);
    }
  };

  const confirmLanguageChange = (language) => {
    if (language === locale) return;
    Alert.alert(texts.settingsTitles.language, texts.settingsContents.language.restartPrompt, [
      { text: texts.settingsContents.termsAndConditions.abort, style: 'cancel' },
      { text: texts.settingsContents.language.restart, onPress: () => changeLanguage(language) }
    ]);
  };

  return (
    <WrapperHorizontal>
      <SettingsRadioGroup
        title={texts.settingsTitles.language}
        options={locales.map((language) => ({
          value: language,
          label: names[language] ?? languageLabel(language)
        }))}
        value={locale}
        disabled={changingLocale}
        onChange={confirmLanguageChange}
      />
    </WrapperHorizontal>
  );
};
