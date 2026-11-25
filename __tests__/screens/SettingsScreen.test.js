/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { Alert, SectionList, TouchableOpacity } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { useQuery } from 'react-query';

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

jest.mock('../../src/components/TextListItem', () => ({
  TextListItem: jest.requireMock('../../src/components').TextListItem
}));

jest.mock('../../src/components/form/Input', () => ({ Input: () => null }));
jest.mock('../../src/components/SectionHeader', () => ({ SectionHeader: () => null }));
jest.mock('../../src/components/SettingsToggle', () => ({ SettingsToggle: () => null }));
jest.mock('react-query', () => ({ ...jest.requireActual('react-query'), useQuery: jest.fn() }));

jest.mock('../../src/hooks', () => ({
  useMatomoTrackScreenView: jest.fn()
}));

jest.mock('../../src/config', () => ({
  colors: { refreshControl: '#000000' },
  consts: {
    a11yLabel: { button: '(Taste)' },
    MATOMO_TRACKING: { SCREEN_VIEW: { SETTINGS: 'Settings' } }
  },
  normalize: (value) => value,
  texts: {
    errors: {
      errorTitle: 'Fehler'
    },
    eventReminders: jest.requireActual('../../src/config/texts').texts.eventReminders,
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

jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: require('react').createContext({ isConnected: false, isMainserverUp: false })
}));

import { clearPersistentCaches } from '../../src/ReactQueryProvider';
import { EventReminderSettings } from '../../src/components/EventReminderControls';
import { SectionHeader } from '../../src/components/SectionHeader';
import { SettingsToggle } from '../../src/components/SettingsToggle';
import { PersonalizedPushSettings } from '../../src/components/settings';
import * as eventReminders from '../../src/pushNotifications/EventReminderLocalNotifications';
import {
  SETTINGS_SCREENS,
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
    useQuery.mockReturnValue({});
  });

  it.each([
    [false, false, true, true, true],
    [false, false, true, false, false],
    [true, false, true, false, true],
    [false, true, true, false, true],
    [true, true, true, true, true],
    [false, true, false, false, true]
  ])(
    'places the entry and sections with single reminders %s, category reminders %s, remote push %s, and remote categories %s',
    async (singleEnabled, categoryEnabled, showRemotePush, remoteCategories, showPushPage) => {
      const globalSettings = {
        ...initialContext.globalSettings,
        settings: {
          pushNotifications: showRemotePush,
          personalizedPush: {
            ...(remoteCategories
              ? { categories: { queryVariables: { tagList: ['news_item'] } } }
              : {}),
            eventReminders: { singleEnabled, categoryEnabled }
          }
        }
      };
      const screen = (params) => (
        <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
          <SettingsScreen navigation={navigation} route={{ params }} />
        </SettingsContext.Provider>
      );
      let tree;
      await act(async () => {
        tree = renderer.create(screen());
      });
      const entries = tree.root.findByType(SectionList).props.sections.flatMap(({ data }) => data);
      expect(entries.includes(SETTINGS_SCREENS.EVENT_REMINDERS)).toBe(false);
      expect(entries.includes(SETTINGS_SCREENS.PERSONALIZED_PUSH)).toBe(showPushPage);

      await act(async () => {
        tree.update(screen({ setting: SETTINGS_SCREENS.PERSONALIZED_PUSH }));
      });
      const {
        children: entry,
        footer,
        showRemotePush: remoteToggle
      } = tree.root.findByType(PersonalizedPushSettings).props;
      expect(entry ? entry.props.item.params.setting : null).toBe(
        singleEnabled || categoryEnabled ? SETTINGS_SCREENS.EVENT_REMINDERS : null
      );
      if (entry) expect(entry.props.item.isHeadlineTitle).toBe(false);
      expect(footer?.props.embeddedCategories ?? false).toBe(categoryEnabled);
      expect(remoteToggle).toBe(showRemotePush);

      await act(async () => {
        tree.update(screen({ setting: SETTINGS_SCREENS.EVENT_REMINDERS }));
      });
      const groups = tree.root.findAllByType(SectionHeader).map(({ props }) => props.title);
      expect(groups.includes('Einzelne Erinnerungen')).toBe(singleEnabled);
      expect(groups.includes('Kategorie-Abos')).toBe(categoryEnabled);
      await act(async () => tree.unmount());
    }
  );

  it('lists available event categories and keeps a saved subscription usable when missing from the catalog', async () => {
    useQuery.mockReturnValue({ data: [{ id: '1', name: 'Kultur' }] });
    const read = jest.spyOn(eventReminders, 'readEventReminderSettings').mockResolvedValue({
      singles: {},
      subscriptions: {
        2: { category: { id: '2', name: 'Sport' }, rule: { kind: 'relative', leadDays: 3 } }
      },
      categoryPlan: {}
    });
    const remove = jest
      .spyOn(eventReminders, 'removeEventCategorySubscription')
      .mockResolvedValue();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    let tree;
    await act(async () => {
      tree = renderer.create(
        <SettingsContext.Provider
          value={{
            ...initialContext,
            globalSettings: {
              settings: { personalizedPush: { eventReminders: { categoryEnabled: true } } }
            }
          }}
        >
          <EventReminderSettings embeddedCategories navigation={navigation} />
        </SettingsContext.Provider>
      );
    });
    const [available, subscribed] = tree.root
      .findAllByType(SettingsToggle)
      .map(({ props }) => props.item);
    expect(available).toMatchObject({ title: 'Kultur', value: false });
    expect(subscribed).toMatchObject({ title: 'Sport', value: true });
    const revert = jest.fn();
    subscribed.onDeactivate(revert);
    expect(revert).toHaveBeenCalledTimes(1);
    expect(remove).not.toHaveBeenCalled();
    await act(async () => {
      await alert.mock.calls[0][2].find(({ style }) => style === 'destructive').onPress();
    });
    expect(remove).toHaveBeenCalledWith('2', { singleEnabled: false, categoryEnabled: true });
    await act(async () => tree.unmount());
    alert.mockRestore();
    remove.mockRestore();
    read.mockRestore();
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
