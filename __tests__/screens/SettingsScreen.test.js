/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import renderer, { act } from 'react-test-renderer';

jest.mock('../../src/components', () => {
  const { Text, View } = require('react-native');

  return {
    AugmentedReality: () => null,
    LoadingContainer: ({ children }) => <View>{children}</View>,
    RegularText: ({ children }) => <Text>{children}</Text>,
    SafeAreaViewFlex: ({ children }) => <View>{children}</View>,
    SettingsToggle: () => null,
    TextListItem: () => null,
    Wrapper: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../src/components/settings', () => ({
  ListSettings: () => null,
  LocationSettings: () => null,
  MowasRegionSettings: () => null,
  PermanentFilterSettings: () => null,
  PersonalizedPushSettings: () => null
}));

jest.mock('../../src/hooks', () => ({
  useMatomoTrackScreenView: jest.fn()
}));

jest.mock('../../src/config', () => ({
  colors: { refreshControl: '#000000' },
  consts: { MATOMO_TRACKING: { SCREEN_VIEW: { SETTINGS: 'Settings' } } },
  normalize: (value) => value,
  texts: {
    errors: {
      errorTitle: 'Fehler'
    },
    profile: {
      termsAndConditionsAlertTitle: 'Datenschutzhinweise'
    },
    settingsContents: {
      analytics: {
        no: 'Nein',
        onActivate: '',
        onDeactivate: '',
        yes: 'Ja'
      },
      ar: { setting: 'AR' },
      list: { setting: 'Liste' },
      locationService: { setting: 'Standort' },
      mowasRegion: { setting: 'Mowas' },
      onboarding: {
        ok: 'OK',
        onActivate: '',
        onDeactivate: ''
      },
      permanentFilter: { setting: 'Filter' },
      personalizedPush: { setting: 'Push' },
      termsAndConditions: {
        abort: 'Abbrechen',
        ok: 'OK',
        onDeactivate: ''
      }
    },
    settingsScreen: {
      intro: '',
      resetPersistentCaches: 'Persistente Caches zurücksetzen',
      resetPersistentCachesAbort: 'Abbrechen',
      resetPersistentCachesConfirm: 'Zurücksetzen',
      resetPersistentCachesContent: 'Sollen die persistenten Caches zurückgesetzt werden?',
      resetPersistentCachesError: 'Persistente Caches konnten nicht zurückgesetzt werden.'
    },
    settingsTitles: {
      analytics: 'Matomo Analytics',
      onboarding: 'Onboarding',
      pushNotifications: 'Push-Benachrichtigungen',
      termsAndConditions: 'Datenschutzhinweise'
    }
  }
}));

jest.mock('../../src/helpers', () => ({
  addToStore: jest.fn(),
  createMatomoUserId: jest.fn(),
  getAccessibilitySettingsEntryEnabled: jest.fn(() => false),
  matomoSettings: jest.fn(),
  readFromStore: jest.fn(),
  removeMatomoUserId: jest.fn()
}));

jest.mock('../../src/pushNotifications', () => ({
  handleSystemPermissions: jest.fn(),
  PushNotificationStorageKeys: {},
  setInAppPermission: jest.fn(),
  showSystemPermissionMissingDialog: jest.fn()
}));

jest.mock('../../src/OnboardingManager', () => ({
  HAS_TERMS_AND_CONDITIONS_STORE_KEY: 'hasTermsAndConditions',
  ONBOARDING_STORE_KEY: 'onboarding',
  TERMS_AND_CONDITIONS_STORE_KEY: 'termsAndConditions'
}));

jest.mock('../../src/types', () => ({
  ScreenName: { Settings: 'Settings' }
}));

jest.mock('../../src/ReactQueryProvider', () => ({
  clearPersistentCaches: jest.fn()
}));

import { clearPersistentCaches } from '../../src/ReactQueryProvider';
import {
  SettingsScreen,
  confirmResetPersistentCaches,
  onActivatePushNotifications,
  onDeactivatePushNotifications
} from '../../src/screens/SettingsScreen';
import { handleSystemPermissions, setInAppPermission } from '../../src/pushNotifications';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';

describe('SettingsScreen', () => {
  const navigation = { navigate: jest.fn() };
  const route = {};
  const resetCachesLabel = 'Persistente Caches zurücksetzen';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a dev-only persistent cache reset link and clears caches after confirmation', async () => {
    jest.mocked(clearPersistentCaches).mockResolvedValue(undefined);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const globalSettings = {
      ...initialContext.globalSettings,
      settings: {
        pushNotifications: false
      }
    };
    let tree;

    await act(async () => {
      tree = renderer.create(
        <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
          <SettingsScreen navigation={navigation} route={route} />
        </SettingsContext.Provider>
      );
    });

    expect(tree.root.findAllByProps({ children: resetCachesLabel }).length).toBeGreaterThan(0);

    const resetLink = tree.root
      .findAllByType(TouchableOpacity)
      .find((node) => node.findAllByProps({ children: resetCachesLabel }).length > 0);

    await act(async () => {
      resetLink.props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Persistente Caches zurücksetzen',
      'Sollen die persistenten Caches zurückgesetzt werden?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Abbrechen', style: 'cancel' }),
        expect.objectContaining({ text: 'Zurücksetzen' })
      ]),
      { cancelable: true }
    );

    const confirmButton = alertSpy.mock.calls[0][2][1];

    await act(async () => {
      await confirmButton.onPress();
    });

    expect(clearPersistentCaches).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it('surfaces persistent cache reset failures from the confirm action', async () => {
    const error = new Error('cache reset failed');
    jest.mocked(clearPersistentCaches).mockRejectedValue(error);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    confirmResetPersistentCaches();

    const confirmButton = alertSpy.mock.calls[0][2][1];

    await act(async () => {
      await confirmButton.onPress();
    });

    expect(clearPersistentCaches).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'An error occurred while resetting persistent caches:',
      error
    );
    expect(alertSpy).toHaveBeenLastCalledWith(
      'Fehler',
      'Persistente Caches konnten nicht zurückgesetzt werden.'
    );
    warnSpy.mockRestore();
    alertSpy.mockRestore();
  });
});

describe('push notification toggle completion', () => {
  beforeEach(() => jest.clearAllMocks());

  it('waits for registration before reporting successful activation', async () => {
    handleSystemPermissions.mockResolvedValue(true);
    let complete;
    setInAppPermission.mockReturnValue(
      new Promise((resolve) => {
        complete = resolve;
      })
    );
    const revert = jest.fn();
    let settled = false;
    const result = onActivatePushNotifications(revert).then((value) => {
      settled = true;
      return value;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    complete(true);
    await expect(result).resolves.toBe(true);
    expect(revert).not.toHaveBeenCalled();
  });

  it('reports denied system permission as an unsuccessful activation', async () => {
    handleSystemPermissions.mockResolvedValue(false);
    const revert = jest.fn();
    await expect(onActivatePushNotifications(revert)).resolves.toBe(false);
    expect(revert).toHaveBeenCalledTimes(1);
    expect(setInAppPermission).not.toHaveBeenCalled();
  });

  it.each([onActivatePushNotifications, onDeactivatePushNotifications])(
    'reverts the toggle on failed server transitions',
    async (toggle) => {
      handleSystemPermissions.mockResolvedValue(true);
      setInAppPermission.mockResolvedValue(false);
      const revert = jest.fn();
      await expect(toggle(revert)).resolves.toBe(false);
      expect(revert).toHaveBeenCalledTimes(1);
    }
  );

  it('reverts activation when reading system permissions rejects', async () => {
    handleSystemPermissions.mockRejectedValue(new Error('permission read failed'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const revert = jest.fn();
    await expect(onActivatePushNotifications(revert)).resolves.toBe(false);
    expect(revert).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
