/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import renderer from 'react-test-renderer';

const mockAddToStore = jest.fn();
const mockReadFromStore = jest.fn();
const mockRootMount = jest.fn();
const mockRootUnmount = jest.fn();

jest.mock('expo-screen-orientation', () => ({
  lockAsync: jest.fn(),
  OrientationLock: {
    DEFAULT: 'default',
    PORTRAIT_UP: 'portrait-up'
  }
}));

jest.mock('../src/CustomMatomoProvider', () => ({
  CustomMatomoProvider: ({ children }: { children?: React.ReactNode }) => children
}));

jest.mock('../src/helpers/initializationHelper', () => ({
  Initializer: {
    LocationService: 'location-service',
    MatomoTracking: 'matomo-tracking',
    PushNotifications: 'push-notifications'
  },
  Initializers: {
    'location-service': jest.fn(),
    'matomo-tracking': jest.fn(),
    'push-notifications': jest.fn()
  }
}));

jest.mock('../src/helpers/storageHelper', () => ({
  addToStore: (...args: unknown[]) => mockAddToStore(...args),
  readFromStore: (...args: unknown[]) => mockReadFromStore(...args)
}));

jest.mock('../src/RootView', () => {
  const ReactLocal = require('react');

  return ({ children }: { children?: React.ReactNode }) => {
    ReactLocal.useEffect(() => {
      mockRootMount();

      return () => mockRootUnmount();
    }, []);

    return ReactLocal.createElement('mock-root-view', null, children);
  };
});

jest.mock('../src/screens/AppIntroScreen', () => {
  const ReactLocal = require('react');

  return {
    AppIntroScreen: (props: object) => ReactLocal.createElement('mock-app-intro', props)
  };
});

import {
  ONBOARDING_STORE_KEY,
  OnboardingManager,
  TERMS_AND_CONDITIONS_STORE_KEY
} from '../src/OnboardingManager';
import { SettingsContext } from '../src/SettingsProvider';

describe('OnboardingManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadFromStore.mockImplementation((key: string) =>
      Promise.resolve(key === ONBOARDING_STORE_KEY ? null : 'accepted')
    );
  });

  it('keeps the themed root mounted while switching from onboarding to the main app', async () => {
    let tree: renderer.ReactTestRenderer;
    const settings = {
      globalSettings: {
        settings: {
          locationService: false,
          matomo: false,
          onboarding: true,
          pushNotifications: false
        }
      }
    };

    await renderer.act(async () => {
      tree = renderer.create(
        <SettingsContext.Provider value={settings as never}>
          <OnboardingManager>
            <mock-home-screen />
          </OnboardingManager>
        </SettingsContext.Provider>
      );
    });

    expect(mockReadFromStore).toHaveBeenCalledWith(ONBOARDING_STORE_KEY);
    expect(mockReadFromStore).toHaveBeenCalledWith(TERMS_AND_CONDITIONS_STORE_KEY);
    expect(mockRootMount).toHaveBeenCalledTimes(1);

    const intro = tree!.root.findByType('mock-app-intro' as never);

    await renderer.act(async () => {
      intro.props.setOnboardingComplete();
    });

    expect(tree!.root.findByType('mock-home-screen' as never)).toBeDefined();
    expect(mockRootMount).toHaveBeenCalledTimes(1);
    expect(mockRootUnmount).not.toHaveBeenCalled();
  });
});
