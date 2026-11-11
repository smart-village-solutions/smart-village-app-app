import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { AppLanguagesContext } from '../../src/AppLanguagesProvider';
import { getTextsLocale } from '../../src/helpers/textsLocaleHelper';
import {
  useAboutTranslations,
  useHomeSettingsTranslations,
  useTabNavigationTranslations
} from '../../src/hooks/homeSettingsTranslations';
import { ReactQueryClient } from '../../src/ReactQueryClient';

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: (callback) => jest.requireActual('react').useEffect(callback, [callback])
}));
jest.mock('../../src/ReactQueryClient', () => ({ ReactQueryClient: jest.fn() }));
jest.mock('../../src/AppLanguagesProvider', () => ({
  AppLanguagesContext: jest.requireActual('react').createContext(['de'])
}));
jest.mock('../../src/ProfileProvider', () => ({
  ProfileContext: jest.requireActual('react').createContext({})
}));
jest.mock('../../src/helpers/textsLocaleHelper');

const titlePath = ['homeScreenConfig', 0, 'title'];
const buttonPath = ['homeScreenConfig', 0, 'buttonTitle'];
const settings = {
  homeScreenConfig: [{ title: 'Unser Kalender', buttonTitle: 'Alle Termine', route: 'Events' }]
};

const result = (entries) => ({
  scope: 'demo',
  data: { publicJsonFile: { translations: entries } }
});

it('translates configured navigation text by file and leaves routes and links alone', async () => {
  getTextsLocale.mockReturnValue('es');
  const tabs = { tabConfigs: [{ label: 'Mehr', screenName: 'About' }] };
  const about = {
    entries: [{ title: 'Datenschutz', subtitle: 'Hinweise', webUrl: 'https://example.com' }],
    headlineAbout: 'Über die App'
  };
  const ready = (path, original, text) => ({ path, original, text, state: 'ready' });
  const rawRequest = jest.fn(async (_query, { name }) =>
    result(
      name === 'tabNavigation'
        ? [
            ready(['tabConfigs', 0, 'label'], 'Mehr', 'Más'),
            ready(['tabConfigs', 0, 'screenName'], 'About', 'Changed')
          ]
        : [
            ready(['headlineAbout'], 'Über die App', 'Acerca de la aplicación'),
            ready(['entries', 0, 'title'], 'Datenschutz', 'Privacidad'),
            ready(['entries', 0, 'subtitle'], 'Alter Text', 'Changed'),
            ready(['entries', 0, 'webUrl'], 'https://example.com', 'Changed')
          ]
    )
  );
  ReactQueryClient.mockResolvedValue({ rawRequest, cacheScope: async () => 'demo' });
  let displayedTabs;
  let displayedAbout;
  const Probe = () => {
    displayedTabs = useTabNavigationTranslations(tabs, true);
    displayedAbout = useAboutTranslations(about, true, 'homeAbout');
    return null;
  };
  let tree;
  try {
    await act(async () => {
      tree = renderer.create(
        <AppLanguagesContext.Provider value={['de', 'es']}>
          <Probe />
        </AppLanguagesContext.Provider>
      );
    });
    expect(rawRequest.mock.calls.map(([, { name }]) => name)).toEqual([
      'tabNavigation',
      'homeAbout'
    ]);
    expect(displayedTabs.tabConfigs[0]).toEqual({ label: 'Más', screenName: 'About' });
    expect(displayedAbout).toEqual({
      entries: [{ title: 'Privacidad', subtitle: 'Hinweise', webUrl: 'https://example.com' }],
      headlineAbout: 'Acerca de la aplicación'
    });
    expect(tabs.tabConfigs[0].label).toBe('Mehr');
    expect(about.entries[0].title).toBe('Datenschutz');
  } finally {
    await act(async () => tree?.unmount());
  }
});

it('keeps originals while pending and applies each matching ready label separately', async () => {
  jest.useFakeTimers();
  getTextsLocale.mockReturnValue('es');
  let finishPoll;
  const pollResponse = new Promise((resolve) => {
    finishPoll = resolve;
  });
  const rawRequest = jest
    .fn()
    .mockResolvedValueOnce(
      result([{ path: titlePath, original: 'Unser Kalender', state: 'pending' }])
    )
    .mockReturnValue(pollResponse);
  ReactQueryClient.mockResolvedValue({ rawRequest, cacheScope: async () => 'demo' });
  let displayed;
  const Probe = () => {
    displayed = useHomeSettingsTranslations(settings, true);
    return null;
  };
  let tree;
  try {
    await act(async () => {
      tree = renderer.create(
        <AppLanguagesContext.Provider value={['de', 'es']}>
          <Probe />
        </AppLanguagesContext.Provider>
      );
    });
    expect(displayed).toBe(settings);
    expect(rawRequest.mock.calls[0][1]).toMatchObject({ name: 'globalSettings' });
    await act(async () => {
      jest.advanceTimersByTime(1000);
      finishPoll(
        result([
          { path: titlePath, original: 'Unser Kalender', text: 'Our calendar', state: 'ready' },
          { path: buttonPath, original: 'Alter Button', text: 'Old button', state: 'ready' }
        ])
      );
    });
    expect(displayed.homeScreenConfig[0]).toEqual({
      title: 'Our calendar',
      buttonTitle: 'Alle Termine',
      route: 'Events'
    });
    getTextsLocale.mockReturnValue('de');
    await act(async () => {
      tree.update(
        <AppLanguagesContext.Provider value={['de', 'es']}>
          <Probe />
        </AppLanguagesContext.Provider>
      );
    });
    expect(displayed).toBe(settings);
  } finally {
    await act(async () => tree?.unmount());
    jest.useRealTimers();
  }
});
