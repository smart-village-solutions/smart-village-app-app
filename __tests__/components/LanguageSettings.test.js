/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { Alert, ScrollView } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { AppLanguageNamesContext, AppLanguagesContext } from '../../src/AppLanguagesProvider';
import { LanguageSettings } from '../../src/components/settings/LanguageSettings';
import { Radiobutton } from '../../src/components/Radiobutton';
import { texts, setTextsLocale } from '../../src/config/texts';
import {
  getTextsLocalePreference,
  saveTextsLocaleAndReload
} from '../../src/helpers/textsLocaleHelper';

jest.mock('../../src/components/Radiobutton', () => ({ Radiobutton: () => null }));
jest.mock('../../src/components/Text', () => ({
  BoldText: ({ children }) => children,
  RegularText: ({ children }) => {
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  }
}));
jest.mock('../../src/components/Wrapper', () => ({
  WrapperHorizontal: ({ children }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  }
}));
jest.mock('../../src/helpers/textsLocaleHelper', () => ({
  getTextsLocalePreference: jest.fn(() => {
    const { texts, textsByLocale } = require('../../src/config/texts');
    return Object.keys(textsByLocale).find((locale) => textsByLocale[locale] === texts);
  }),
  saveTextsLocaleAndReload: jest.fn()
}));

const menu = (locales = ['de', 'en', 'fr', 'pt-PT'], names = {}) => (
  <AppLanguagesContext.Provider value={locales}>
    <AppLanguageNamesContext.Provider value={names}>
      <LanguageSettings />
    </AppLanguageNamesContext.Provider>
  </AppLanguagesContext.Provider>
);

const languageRadios = () => tree.root.findAllByType(Radiobutton).slice(1);

let tree;
beforeEach(async () => {
  jest.clearAllMocks();
  getTextsLocalePreference.mockImplementation(() => {
    const { texts, textsByLocale } = require('../../src/config/texts');
    return Object.keys(textsByLocale).find((locale) => textsByLocale[locale] === texts);
  });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await act(async () => {
    tree = renderer.create(menu());
  });
});

afterEach(async () => {
  await act(async () => {
    tree.unmount();
  });
  setTextsLocale('de');
  jest.restoreAllMocks();
});

it('puts the language choices inside a scroll view', () => {
  const scrollView = tree.root.findByType(ScrollView);
  expect(scrollView.findAllByType(Radiobutton)).toHaveLength(5);
});

it('shows the languages by name even without Intl.DisplayNames', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(Intl, 'DisplayNames');
  Object.defineProperty(Intl, 'DisplayNames', { configurable: true, value: undefined });
  try {
    await act(async () =>
      tree.update(
        menu(['de', 'en', 'fr', 'hu', 'pt-PT'], {
          de: 'Deutsch',
          en: 'English',
          fr: 'Français',
          hu: 'Magyar',
          'pt-PT': 'Português (Portugal)',
          es: 'Español'
        })
      )
    );
    expect(languageRadios().map(({ props }) => props.title)).toEqual([
      'Deutsch',
      'English',
      'Français',
      'Magyar',
      'Português (Portugal)'
    ]);
  } finally {
    if (descriptor) Object.defineProperty(Intl, 'DisplayNames', descriptor);
    else delete Intl.DisplayNames;
  }
});

it('informs about restarting before saving another language', async () => {
  const radios = languageRadios();
  expect(radios[0].props.selected).toBe(true);
  expect(radios[0].props.disabled).toBe(false);
  await act(async () => radios[0].props.onPress());
  expect(Alert.alert).not.toHaveBeenCalled();
  await act(async () => {
    radios[1].props.onPress();
  });
  expect(Alert.alert).toHaveBeenCalledWith(
    texts.settingsTitles.language,
    texts.settingsContents.language.restartPrompt,
    expect.arrayContaining([expect.objectContaining({ style: 'cancel' })])
  );
  expect(saveTextsLocaleAndReload).not.toHaveBeenCalled();
  await act(async () => {
    await Alert.alert.mock.calls[0][2][1].onPress();
  });
  expect(saveTextsLocaleAndReload).toHaveBeenCalledWith('en');
});

it('disables choices while applying a language and allows recovery after failure', async () => {
  let failReload;
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
  saveTextsLocaleAndReload.mockImplementationOnce(
    () =>
      new Promise((resolve, reject) => {
        failReload = reject;
      })
  );
  await act(async () => {
    languageRadios()[1].props.onPress();
  });
  let changing;
  await act(async () => {
    changing = Alert.alert.mock.calls[0][2][1].onPress();
  });
  expect(languageRadios().every((radio) => radio.props.disabled)).toBe(true);
  await act(async () => {
    failReload(new Error('reload failed'));
    await changing;
  });
  expect(Alert.alert).toHaveBeenLastCalledWith(
    texts.settingsTitles.language,
    texts.settingsContents.language.error
  );
  expect(languageRadios()[1].props.disabled).toBe(false);
  expect(languageRadios()[0].props.selected).toBe(true);
  expect(warning).toHaveBeenCalled();
});

it('reads the active catalog from the active texts export', async () => {
  setTextsLocale('en');
  await act(async () => {
    tree.update(menu());
  });
  const radios = languageRadios();
  expect(radios[0].props.selected).toBe(false);
  expect(radios[1].props.selected).toBe(true);
  expect(radios[1].props.disabled).toBe(false);
});

it('offers only the current Mainserver languages and ignores a revoked choice', async () => {
  await act(async () => tree.update(menu(['de', 'fr'])));
  const radios = languageRadios();
  expect(radios).toHaveLength(2);
  await act(async () => radios[1].props.onPress());
  await act(async () => tree.update(menu(['de'])));
  await act(async () => Alert.alert.mock.calls[0][2][1].onPress());
  expect(saveTextsLocaleAndReload).not.toHaveBeenCalled();
  expect(languageRadios()).toHaveLength(1);
});

it('offers the system preference separately from its resolved language', async () => {
  getTextsLocalePreference.mockReturnValue('system');
  await act(async () => tree.update(menu()));
  const radios = tree.root.findAllByType(Radiobutton);
  expect(radios[0].props.title).toBe(texts.settingsContents.accessibility.theme.system);
  expect(radios[0].props.selected).toBe(true);
  expect(languageRadios().every((radio) => !radio.props.selected)).toBe(true);
  await act(async () => languageRadios()[1].props.onPress());
  await act(async () => Alert.alert.mock.calls[0][2][1].onPress());
  expect(saveTextsLocaleAndReload).toHaveBeenCalledWith('en');
});

it('allows returning to the system language with the usual restart confirmation', async () => {
  await act(async () => tree.root.findAllByType(Radiobutton)[0].props.onPress());
  expect(saveTextsLocaleAndReload).not.toHaveBeenCalled();
  await act(async () => Alert.alert.mock.calls[0][2][1].onPress());
  expect(saveTextsLocaleAndReload).toHaveBeenCalledWith('system');
});

it('shows German after manual-language revocation and allows selecting it explicitly', async () => {
  getTextsLocalePreference.mockReturnValue('fr');
  await act(async () => tree.update(menu(['de'])));
  expect(languageRadios()[0].props.selected).toBe(true);
  await act(async () => languageRadios()[0].props.onPress());
  await act(async () => Alert.alert.mock.calls[0][2][1].onPress());
  expect(saveTextsLocaleAndReload).toHaveBeenCalledWith('de');
});
