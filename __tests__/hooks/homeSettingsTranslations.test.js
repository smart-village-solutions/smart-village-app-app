import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { getTextsLocale } from '../../src/helpers/textsLocaleHelper';
import { useHomeSettingsTranslations } from '../../src/hooks/homeSettingsTranslations';
import { ReactQueryClient } from '../../src/ReactQueryClient';

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: (callback) => jest.requireActual('react').useEffect(callback, [callback])
}));
jest.mock('../../src/ReactQueryClient');
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
  data: { homeSettingsTranslations: entries }
});

it('keeps originals while pending and applies each matching ready label separately', async () => {
  jest.useFakeTimers();
  getTextsLocale.mockReturnValue('en');
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
      tree = renderer.create(<Probe />);
    });
    expect(displayed).toBe(settings);
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
      tree.update(<Probe />);
    });
    expect(displayed).toBe(settings);
  } finally {
    await act(async () => tree?.unmount());
    jest.useRealTimers();
  }
});
