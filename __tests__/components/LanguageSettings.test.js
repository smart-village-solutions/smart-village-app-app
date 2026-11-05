/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { AppLanguagesContext } from '../../src/AppLanguagesProvider';
import { LanguageSettings } from '../../src/components/settings/LanguageSettings';
import { Radiobutton } from '../../src/components/Radiobutton';
import { texts, setTextsLocale } from '../../src/config/texts';
import { saveTextsLocaleAndReload } from '../../src/helpers/textsLocaleHelper';

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
  getTextsLocale: () => {
    const { texts, textsByLocale } = require('../../src/config/texts');
    return Object.keys(textsByLocale).find((locale) => textsByLocale[locale] === texts);
  },
  saveTextsLocaleAndReload: jest.fn()
}));

const menu = (locales = ['de', 'en', 'fr', 'pt-PT']) => (
  <AppLanguagesContext.Provider value={locales}>
    <LanguageSettings />
  </AppLanguagesContext.Provider>
);

let tree;
beforeEach(async () => {
  jest.clearAllMocks();
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

it('shows the languages by name even without Intl.DisplayNames', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(Intl, 'DisplayNames');
  Object.defineProperty(Intl, 'DisplayNames', { configurable: true, value: undefined });
  try {
    await act(async () => tree.update(menu()));
    expect(tree.root.findAllByType(Radiobutton).map(({ props }) => props.title)).toEqual([
      'Deutsch',
      'English',
      'Français',
      'Português (Portugal)'
    ]);
  } finally {
    if (descriptor) Object.defineProperty(Intl, 'DisplayNames', descriptor);
    else delete Intl.DisplayNames;
  }
});

it('informs about restarting before saving another language', async () => {
  const radios = tree.root.findAllByType(Radiobutton);
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
    tree.root.findAllByType(Radiobutton)[1].props.onPress();
  });
  let changing;
  await act(async () => {
    changing = Alert.alert.mock.calls[0][2][1].onPress();
  });
  expect(tree.root.findAllByType(Radiobutton).every((radio) => radio.props.disabled)).toBe(true);
  await act(async () => {
    failReload(new Error('reload failed'));
    await changing;
  });
  expect(Alert.alert).toHaveBeenLastCalledWith(
    texts.settingsTitles.language,
    texts.settingsContents.language.error
  );
  expect(tree.root.findAllByType(Radiobutton)[1].props.disabled).toBe(false);
  expect(tree.root.findAllByType(Radiobutton)[0].props.selected).toBe(true);
  expect(warning).toHaveBeenCalled();
});

it('reads the active catalog from the active texts export', async () => {
  setTextsLocale('en');
  await act(async () => {
    tree.update(menu());
  });
  const radios = tree.root.findAllByType(Radiobutton);
  expect(radios[0].props.selected).toBe(false);
  expect(radios[1].props.selected).toBe(true);
  expect(radios[1].props.disabled).toBe(false);
});

it('offers only the current Mainserver languages and ignores a revoked choice', async () => {
  await act(async () => tree.update(menu(['de', 'fr'])));
  const radios = tree.root.findAllByType(Radiobutton);
  expect(radios).toHaveLength(2);
  await act(async () => radios[1].props.onPress());
  await act(async () => tree.update(menu(['de'])));
  await act(async () => Alert.alert.mock.calls[0][2][1].onPress());
  expect(saveTextsLocaleAndReload).not.toHaveBeenCalled();
  expect(tree.root.findAllByType(Radiobutton)).toHaveLength(1);
});
