/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { Alert, DeviceEventEmitter, SectionList, TouchableOpacity } from 'react-native';
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
jest.mock('../../src/components/Radiobutton', () => ({ Radiobutton: () => null }));
jest.mock('../../src/components/SettingsToggle', () => ({ SettingsToggle: () => null }));
jest.mock('../../src/components/ListComponent', () => ({ ListComponent: () => null }));
jest.mock('../../src/components/Modal', () => ({ Modal: ({ children }) => children }));
jest.mock('react-query', () => ({ ...jest.requireActual('react-query'), useQuery: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}));

jest.mock('../../src/hooks', () => ({
  useMatomoTrackScreenView: jest.fn()
}));

jest.mock('../../src/config', () => ({
  Icon: { ArrowRight: () => null },
  colors: { refreshControl: '#000000' },
  consts: {
    a11yLabel: { button: '(Taste)' },
    ROOT_ROUTE_NAMES: { EVENT_RECORDS: 'events' },
    MATOMO_TRACKING: { SCREEN_VIEW: { SETTINGS: 'Settings' } }
  },
  normalize: (value) => value,
  texts: {
    detailTitles: { eventRecord: 'Veranstaltung' },
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
      personalizedPush: {
        setting: 'Push',
        eventSectionTitle: 'Erinnerungen für Veranstaltungskategorien'
      },
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
  parseListItemsFromQuery: (query, data) => data[query],
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
import { ListComponent } from '../../src/components/ListComponent';
import { Modal } from '../../src/components/Modal';
import { SectionHeader } from '../../src/components/SectionHeader';
import { SettingsToggle } from '../../src/components/SettingsToggle';
import { TextListItem } from '../../src/components/TextListItem';
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
            ...(remoteCategories || categoryEnabled
              ? {
                  categories: {
                    queryVariables: {
                      tagList: [
                        ...(remoteCategories ? ['news_item'] : []),
                        ...(categoryEnabled ? ['event_record'] : [])
                      ]
                    }
                  }
                }
              : {}),
            eventReminders: { singleEnabled }
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
        singleEnabled ? SETTINGS_SCREENS.EVENT_REMINDERS : null
      );
      if (entry) expect(entry.props.item.isHeadlineTitle).toBe(false);
      expect(footer?.props.embeddedCategories ?? false).toBe(categoryEnabled);
      expect(remoteToggle).toBe(showRemotePush);

      await act(async () => {
        tree.update(screen({ setting: SETTINGS_SCREENS.EVENT_REMINDERS }));
      });
      const groups = tree.root.findAllByType(SectionHeader).map(({ props }) => props.title);
      expect(groups.includes('Einzelne Erinnerungen')).toBe(singleEnabled);
      expect(tree.root.findAllByType(SettingsToggle)).toHaveLength(0);
      await act(async () => tree.unmount());
    }
  );

  it('lists available event categories and keeps a saved subscription usable when missing from the catalog', async () => {
    useQuery.mockImplementation(([key]) => ({
      data:
        key === 'event-reminder-categories' ? [{ id: '1', name: 'Kultur &#x2F; Musik' }] : undefined
    }));
    const local = {
      singles: {},
      subscriptions: {
        2: {
          category: { id: '2', name: 'Sport &#47; Spiel' },
          rule: { kind: 'relative', leadDays: 3 }
        },
        3: {
          category: { id: '3', name: '&#196;rger &amp; Spa&szlig;' },
          paused: true,
          rule: { kind: 'relative', leadDays: 1 },
          syncedAt: Date.UTC(2026, 10, 25, 14),
          syncStatus: 'failed'
        }
      },
      categoryPlan: {}
    };
    const read = jest
      .spyOn(eventReminders, 'readEventReminderSettings')
      .mockImplementation(async () => ({ ...local }));
    const remove = jest.spyOn(eventReminders, 'pauseEventCategorySubscription').mockResolvedValue();
    const save = jest
      .spyOn(eventReminders, 'saveEventCategorySubscription')
      .mockImplementation(async ({ id }) => {
        local.subscriptions[id].paused = false;
        DeviceEventEmitter.emit(eventReminders.EVENT_REMINDERS_CHANGED);
        return 'saved';
      });
    const deleteSubscription = jest
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
              settings: {
                personalizedPush: { categories: { queryVariables: { tagList: ['event_record'] } } }
              }
            }
          }}
        >
          <EventReminderSettings embeddedCategories navigation={navigation} />
        </SettingsContext.Provider>
      );
    });
    const [paused, available, subscribed] = tree.root
      .findAllByType(SettingsToggle)
      .map(({ props }) => props.item);
    expect(available).toMatchObject({ title: 'Kultur / Musik', value: false });
    expect(subscribed).toMatchObject({ title: 'Sport / Spiel', value: true });
    expect(paused).toMatchObject({ title: 'Ärger & Spaß', value: false });
    await act(async () => paused.onActivate(jest.fn()));
    expect(save).toHaveBeenCalledWith(
      { id: '3', name: '&#196;rger &amp; Spa&szlig;' },
      { kind: 'relative', leadDays: 1 },
      undefined,
      { singleEnabled: false, categoryEnabled: true }
    );
    const active = tree.root.findAllByType(SettingsToggle)[0].props.item;
    expect(active.value).toBe(true);
    expect(tree.root.findAllByType(SettingsToggle)).toHaveLength(3);
    expect(tree.root.findAllByType(TextListItem)).toHaveLength(0);
    expect(tree.root.findAllByType(Modal)).toHaveLength(0);
    act(() => active.onOpen());
    expect(tree.root.findByType(Modal)).toBeTruthy();
    const containsText = (text) =>
      tree.root.findAll(
        (node) => typeof node.props.children === 'string' && node.props.children.includes(text)
      ).length > 0;
    expect(containsText('Kategorie: Ärger & Spaß')).toBe(true);
    expect(containsText('Letzter erfolgreicher Abgleich')).toBe(true);
    expect(containsText('Datenabgleich derzeit nicht möglich')).toBe(true);
    expect(tree.root.findByType(Modal).findByType(SectionHeader).props.title).toBe(
      'Kategorie-Abo bearbeiten'
    );
    const deleteAction = tree.root
      .findAllByType(TouchableOpacity)
      .find(({ props }) => props.accessibilityLabel === 'Kategorie-Abo löschen');
    act(() => deleteAction.props.onPress());
    await act(async () => {
      await alert.mock.lastCall[2].find(({ style }) => style === 'destructive').onPress();
    });
    expect(deleteSubscription).toHaveBeenCalledWith('3', {
      singleEnabled: false,
      categoryEnabled: true
    });
    const revert = jest.fn();
    subscribed.onDeactivate(revert);
    expect(revert).toHaveBeenCalledTimes(1);
    expect(remove).not.toHaveBeenCalled();
    await act(async () => {
      await alert.mock.lastCall[2].find(({ style }) => style === 'destructive').onPress();
    });
    expect(remove).toHaveBeenCalledWith('2', { singleEnabled: false, categoryEnabled: true });
    await act(async () => tree.unmount());
    alert.mockRestore();
    remove.mockRestore();
    save.mockRestore();
    deleteSubscription.mockRestore();
    read.mockRestore();
  });

  it('uses the event list layout for upcoming single reminders and hides completed ones', async () => {
    const entry = (id, status) => ({
      occurrence: { eventId: id, occurrenceId: id, title: id, date: '2099-06-15', time: '20:00' },
      rule: { kind: 'relative', leadDays: 1 },
      status
    });
    const read = jest.spyOn(eventReminders, 'readEventReminderSettings').mockResolvedValue({
      singles: {
        '1:1': entry('1', 'scheduled'),
        '2:2': entry('2', 'elapsed'),
        '3:3': entry('3', 'paused')
      },
      subscriptions: {}
    });
    const deleteReminder = jest.spyOn(eventReminders, 'removeEventReminder').mockResolvedValue();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    let tree;
    await act(async () => {
      tree = renderer.create(
        <SettingsContext.Provider
          value={{
            globalSettings: {
              settings: { personalizedPush: { eventReminders: { singleEnabled: true } } }
            }
          }}
        >
          <EventReminderSettings navigation={navigation} />
        </SettingsContext.Provider>
      );
    });
    const list = tree.root.findByType(ListComponent).props;
    expect(list).toMatchObject({ query: 'eventRecords', horizontal: false, sectionByDate: true });
    expect(list.navigation).toBe(navigation);
    expect(list.data.map(({ id }) => id)).toEqual(['1:1', '3:3']);
    act(() => list.data[1].onPress());
    const editor = tree.root.findByType(Modal);
    const deleteAction = editor
      .findAllByType(TouchableOpacity)
      .find(({ props }) => props.accessibilityLabel === 'Einzelerinnerung löschen');
    act(() => deleteAction.props.onPress());
    await act(async () => {
      await alert.mock.lastCall[2].find(({ style }) => style === 'destructive').onPress();
    });
    expect(deleteReminder).toHaveBeenCalledWith(entry('3', 'paused').occurrence, {
      singleEnabled: true,
      categoryEnabled: false
    });
    await act(async () => tree.unmount());
    alert.mockRestore();
    deleteReminder.mockRestore();
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
