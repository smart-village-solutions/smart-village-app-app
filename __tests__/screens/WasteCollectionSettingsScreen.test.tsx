/* eslint-disable react/prop-types */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import {
  getWasteCollectionSettingsViewState,
  WasteCollectionSettingsScreen
} from '../../src/screens/WasteCollectionSettingsScreen';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';
import { ScreenName } from '../../src/types';
import { saveWasteReminderSettings } from '../../src/helpers';
import {
  storeWasteReminderSettingsWithoutScheduling,
  syncWasteReminderSettingsWithServer
} from '../../src/pushNotifications';

const mockGetLocalNotificationPermission = jest.fn(async () => false);
const mockGetInAppPermission = jest.fn(async () => true);
const mockReadWasteReminderLocalState = jest.fn(async () => ({
  ownerKey: 'push:test',
  scheduledNotificationIds: [],
  scheduledReminderKeys: [],
  serverSyncPayload: {
    activeReminderRegistrations: [
      {
        active: true,
        leadDays: 2,
        slotId: 'first',
        time: '11:30',
        typeKey: 'paper'
      }
    ],
    activeTypes: { paper: { active: true, storeId: 1 } },
    locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
    notificationSettings: { paper: true },
    onDayBefore: true,
    reminderTime: '2000-01-01T08:00:00.000Z',
    usedTypeKeys: ['paper']
  },
  serverSyncStatus: 'synced'
}));
const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn()
};

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback) => callback(),
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: { currentSelectedStreetId: 1 } })
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock(
  'react-native-collapsible',
  () =>
    ({ children, collapsed }) =>
      collapsed ? null : children
);
jest.mock('react-native-elements', () => {
  const React = require('react');
  const { View } = require('react-native');

  const ListItem = ({ children }) => React.createElement(View, null, children);
  ListItem.Content = ({ children }) => React.createElement(View, null, children);

  return {
    Divider: () => React.createElement(View),
    ListItem,
    Tooltip: ({ children }) => React.createElement(View, null, children)
  };
});

jest.mock('../../src/components', () => {
  const React = require('react');
  const { Text, TouchableOpacity, View } = require('react-native');

  const textComponent =
    () =>
    ({ children }) =>
      React.createElement(Text, null, children);

  return {
    BoldText: textComponent(),
    Button: ({ onPress, title }) => React.createElement(TouchableOpacity, { onPress }, title),
    Dot: () => React.createElement(View),
    LoadingSpinner: () => React.createElement(Text, null, 'loading'),
    RegularText: textComponent(),
    SafeAreaViewFlex: ({ children }) => React.createElement(View, null, children),
    Switch: ({ isDisabled, switchValue }) =>
      React.createElement(
        Text,
        null,
        `${switchValue ? 'switch:on' : 'switch:off'}:${isDisabled ? 'disabled' : 'enabled'}`
      ),
    Wrapper: ({ children }) => React.createElement(View, null, children),
    WrapperHorizontal: ({ children }) => React.createElement(View, null, children),
    WrapperRow: ({ children }) => React.createElement(View, null, children),
    WrapperVertical: ({ children }) => React.createElement(View, null, children)
  };
});

let mockUsedTypes = {
  paper: {
    color: '#000000',
    label: 'Paper',
    reminders: {
      channels: { push: true },
      push: {
        slots: [{ default_lead_days: 2, id: 'first', max_lead_days: 7 }]
      }
    },
    selected_color: '#111111'
  }
};

let mockStreetData = {
  wasteAddresses: [
    {
      city: 'Berlin',
      street: 'Test Street',
      wasteLocationTypes: [{ wasteType: 'paper' }],
      zip: '12345'
    }
  ]
};

jest.mock('../../src/hooks', () => ({
  useFilterStreets: () => ({ filterStreets: jest.fn(() => []) }),
  useRenderSuggestions: () => ({
    inputValue: '',
    renderSuggestion: jest.fn(),
    renderSuggestionCities: jest.fn(),
    renderSuggestionStreets: jest.fn()
  }),
  useStreetString: () => ({
    getStreetString: ({ street, zip, city }) => {
      if (zip && city) {
        return `${street} (${zip} ${city})`;
      }

      return street || '';
    }
  }),
  useWasteAddresses: () => ({ data: mockStreetData, loading: false }),
  useWasteStreet: () => ({ data: mockStreetData, loading: false }),
  useWasteTypes: () => ({ data: mockUsedTypes, loading: false }),
  useWasteUsedTypes: () => mockUsedTypes
}));

jest.mock('../../src/jsonValidation', () => ({
  areValidReminderSettings: jest.fn(() => true)
}));

jest.mock('../../src/helpers', () => ({
  formatTime: (date: Date) =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
  saveWasteReminderSettings: jest.fn(),
  storageHelper: {
    setGlobalSettings: jest.fn(async () => undefined)
  }
}));

jest.mock('../../src/pushNotifications', () => ({
  buildWasteReminderSchedule: jest.fn(() => ({
    hasMoreReminders: false,
    localCoverageUntil: undefined,
    reminders: []
  })),
  clearWasteReminderLocalNotifications: jest.fn(async () => undefined),
  getInAppPermission: (...args) => mockGetInAppPermission(...args),
  handleSystemPermissions: jest.fn(async () => false),
  getLocalNotificationPermission: (...args) => mockGetLocalNotificationPermission(...args),
  getReminderSettings: jest.fn(async () => undefined),
  getWasteReminderUiMode: jest.requireActual('../../src/pushNotifications/WasteReminderConfig')
    .getWasteReminderUiMode,
  markWasteReminderServerSyncSynced: jest.fn(async () => undefined),
  normalizePushReminderSlots: jest.requireActual('../../src/pushNotifications/WasteReminderConfig')
    .normalizePushReminderSlots,
  readWasteReminderLocalState: (...args) => mockReadWasteReminderLocalState(...args),
  requestLocalNotificationPermission: jest.fn(async () => true),
  scheduleWasteReminderNotifications: jest.fn(async () => undefined),
  setInAppPermission: jest.fn(async () => true),
  showSystemPermissionMissingDialog: jest.fn(),
  storeWasteReminderSettingsWithoutScheduling: jest.fn(async () => undefined),
  syncWasteReminderSettingsWithServer: jest.fn(async () => ({
    activeTypes: { paper: { active: true, storeId: 1 } },
    serverSyncPayload: undefined,
    success: true
  }))
}));

jest.mock('../../src/reducers', () =>
  jest.requireActual('../../src/reducers/wasteSettingsReducer')
);

jest.mock('../../src/screens', () => ({
  getLocationData: (streetData) => streetData?.wasteAddresses?.[0],
  getPositionStyleByNavigation: () => ({ position: {} })
}));

jest.mock('../../src/config', () => ({
  colors: {
    darkText: '#000000',
    refreshControl: '#000000',
    shadowRgba: 'rgba(0,0,0,0.2)',
    surface: '#ffffff'
  },
  consts: {
    a11yLabel: { button: 'button' }
  },
  device: {
    platform: 'ios'
  },
  Icon: {
    KeyboardArrowUpDown: () => null
  },
  normalize: (value) => value,
  texts: {
    dateTimePicker: { cancel: 'Cancel', ok: 'OK' },
    errors: { errorTitle: 'Error', noData: 'No data' },
    wasteCalendar: {
      chooseCategory: 'Choose category',
      daysBefore: 'Days before',
      myLocation: 'My location',
      notificationsDisabledHint:
        'Main push notifications are disabled. Waste reminders will not be sent.',
      notificationsOn: 'Notifications',
      notificationSettingsLink: 'Open notification settings',
      reminder: 'Reminder',
      reminders: 'Reminders',
      sameDay: 'Same day',
      save: 'Save',
      timeOfDay: 'Time of day',
      oneDayBefore: 'One day before',
      xDaysBefore: 'days before'
    }
  }
}));

describe('WasteCollectionSettingsScreen', () => {
  const collectText = (node: any): string[] => {
    if (typeof node === 'string') {
      return [node];
    }

    if (!node) {
      return [];
    }

    return (node.children ?? []).flatMap((child) => collectText(child));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInAppPermission.mockResolvedValue(true);
    mockGetLocalNotificationPermission.mockResolvedValue(false);
    mockReadWasteReminderLocalState.mockResolvedValue({
      ownerKey: 'push:test',
      scheduledNotificationIds: [],
      scheduledReminderKeys: [],
      serverSyncPayload: {
        activeReminderRegistrations: [
          {
            active: true,
            leadDays: 2,
            slotId: 'first',
            time: '11:30',
            typeKey: 'paper'
          }
        ],
        activeTypes: { paper: { active: true, storeId: 1 } },
        locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
        notificationSettings: { paper: true },
        onDayBefore: true,
        reminderTime: '2000-01-01T08:00:00.000Z',
        usedTypeKeys: ['paper']
      },
      serverSyncStatus: 'synced'
    });
    mockStreetData = {
      wasteAddresses: [
        {
          city: 'Berlin',
          street: 'Test Street',
          wasteLocationTypes: [{ wasteType: 'paper' }],
          zip: '12345'
        }
      ]
    };
    mockUsedTypes = {
      paper: {
        color: '#000000',
        label: 'Paper',
        reminders: {
          channels: { push: true },
          push: {
            slots: [{ default_lead_days: 2, id: 'first', max_lead_days: 7 }]
          }
        },
        selected_color: '#111111'
      }
    };
  });

  describe('getWasteCollectionSettingsViewState', () => {
    it('returns the expected screen state for loading, suggestions, settings, and empty cases', () => {
      expect(
        getWasteCollectionSettingsViewState({
          hasSelectedStreet: false,
          hasStreetSuggestions: false,
          isLoading: true,
          isStreetSelected: true
        })
      ).toBe('loading');

      expect(
        getWasteCollectionSettingsViewState({
          hasSelectedStreet: false,
          hasStreetSuggestions: true,
          isLoading: false,
          isStreetSelected: false
        })
      ).toBe('suggestions');

      expect(
        getWasteCollectionSettingsViewState({
          hasSelectedStreet: true,
          hasStreetSuggestions: false,
          isLoading: false,
          isStreetSelected: true
        })
      ).toBe('settings');

      expect(
        getWasteCollectionSettingsViewState({
          hasSelectedStreet: false,
          hasStreetSuggestions: false,
          isLoading: false,
          isStreetSelected: true
        })
      ).toBe('empty');
    });
  });

  it('keeps loaded flexible reminder times when waste types refresh with a new object reference', async () => {
    const globalSettings = {
      ...initialContext.globalSettings,
      navigation: 'tab',
      waste: {
        streetId: 1,
        streetName: 'Test Street (12345 Berlin)',
        selectedTypeKeys: ['paper']
      }
    };
    let tree;

    await act(async () => {
      tree = renderer.create(
        <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
          <WasteCollectionSettingsScreen />
        </SettingsContext.Provider>
      );
    });

    expect(collectText(tree.toJSON()).join(' ')).toContain('11:30');

    mockUsedTypes = {
      paper: {
        ...mockUsedTypes.paper,
        reminders: {
          channels: { push: true },
          push: {
            slots: [{ default_lead_days: 2, id: 'first', max_lead_days: 7 }]
          }
        }
      }
    };

    await act(async () => {
      tree.update(
        <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
          <WasteCollectionSettingsScreen />
        </SettingsContext.Provider>
      );
    });

    const renderedText = collectText(tree.toJSON()).join(' ');

    expect(renderedText).toContain('11:30');
    expect(renderedText).not.toContain('09:00');
  });

  it('waits for street data before finalizing stored reminder settings', async () => {
    const globalSettings = {
      ...initialContext.globalSettings,
      navigation: 'tab',
      waste: {
        streetId: 1,
        streetName: 'Test Street (12345 Berlin)',
        selectedTypeKeys: ['paper']
      }
    };
    let tree;

    mockStreetData = undefined as any;

    await act(async () => {
      tree = renderer.create(
        <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
          <WasteCollectionSettingsScreen />
        </SettingsContext.Provider>
      );
    });

    mockStreetData = {
      wasteAddresses: [
        {
          city: 'Berlin',
          street: 'Test Street',
          wasteLocationTypes: [{ wasteType: 'paper' }],
          zip: '12345'
        }
      ]
    };

    await act(async () => {
      tree.update(
        <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
          <WasteCollectionSettingsScreen />
        </SettingsContext.Provider>
      );
    });

    const renderedText = collectText(tree.toJSON()).join(' ');

    expect(renderedText).toContain('11:30');
    expect(renderedText).not.toContain('09:00');
  });

  it('does not switch stored active reminders off when permission checks resolve during hydration', async () => {
    const globalSettings = {
      ...initialContext.globalSettings,
      navigation: 'tab',
      waste: {
        streetId: 1,
        streetName: 'Test Street (12345 Berlin)',
        selectedTypeKeys: ['paper']
      }
    };
    let tree;

    mockGetLocalNotificationPermission.mockResolvedValue(true);

    await act(async () => {
      tree = renderer.create(
        <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
          <WasteCollectionSettingsScreen />
        </SettingsContext.Provider>
      );
    });

    const renderedText = collectText(tree.toJSON()).join(' ');

    expect(renderedText).toContain('Reminders Notifications switch:on:enabled');
    expect(renderedText).toContain('11:30');
  });

  it('disables waste reminder controls and links to settings when global push notifications are disabled', async () => {
    const globalSettings = {
      ...initialContext.globalSettings,
      navigation: 'tab',
      waste: {
        streetId: 1,
        streetName: 'Test Street (12345 Berlin)',
        selectedTypeKeys: ['paper']
      }
    };
    let tree;

    mockGetInAppPermission.mockResolvedValue(false);
    mockGetLocalNotificationPermission.mockResolvedValue(true);

    await act(async () => {
      tree = renderer.create(
        <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
          <WasteCollectionSettingsScreen />
        </SettingsContext.Provider>
      );
    });

    const renderedText = collectText(tree.toJSON()).join(' ');

    expect(renderedText).toContain(
      'Main push notifications are disabled. Waste reminders will not be sent.'
    );
    expect(renderedText).toContain('Open notification settings');
    expect(renderedText).toContain('Notifications switch:on:disabled');
    expect(renderedText).toContain('Paper switch:on:disabled');
    expect(renderedText).toContain('11:30');

    const settingsLink = tree.root
      .findAllByType(require('react-native').TouchableOpacity)
      .find((node) => collectText(node).join(' ').includes('Open notification settings'));

    await act(async () => {
      settingsLink.props.onPress();
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith(ScreenName.Settings);
  });

  it('stores waste reminder settings without scheduling when global push notifications are disabled', async () => {
    const globalSettings = {
      ...initialContext.globalSettings,
      navigation: 'tab',
      waste: {
        streetId: 1,
        streetName: 'Test Street (12345 Berlin)',
        selectedTypeKeys: ['paper']
      }
    };
    let tree;

    mockGetInAppPermission.mockResolvedValue(false);
    mockGetLocalNotificationPermission.mockResolvedValue(true);
    (saveWasteReminderSettings as jest.Mock).mockImplementation(
      async ({ scheduleLocalReminderSettings, updateSettings }) => {
        const { localCoverageUntil, reminderSyncRegistrations } =
          await scheduleLocalReminderSettings();

        await updateSettings(localCoverageUntil, reminderSyncRegistrations);
      }
    );

    await act(async () => {
      tree = renderer.create(
        <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
          <WasteCollectionSettingsScreen />
        </SettingsContext.Provider>
      );
    });

    const saveButton = tree.root
      .findAllByType(require('react-native').TouchableOpacity)
      .find((node) => collectText(node).join(' ').includes('Save'));

    await act(async () => {
      await saveButton.props.onPress();
    });

    expect(storeWasteReminderSettingsWithoutScheduling).toHaveBeenCalledWith(
      expect.objectContaining({
        activeReminderRegistrations: [
          expect.objectContaining({
            active: true,
            leadDays: 2,
            slotId: 'first',
            time: '11:30',
            typeKey: 'paper'
          })
        ],
        notificationSettings: { paper: true },
        onDayBefore: true,
        usedTypeKeys: ['paper']
      })
    );
    expect(storeWasteReminderSettingsWithoutScheduling).toHaveBeenCalledWith(
      expect.objectContaining({
        activeTypes: expect.objectContaining({
          paper: expect.objectContaining({
            active: true,
            storeId: 0
          })
        })
      })
    );
    expect(syncWasteReminderSettingsWithServer).not.toHaveBeenCalled();
  });

  it('shows active default reminder details for a newly selected street while global push is disabled', async () => {
    const globalSettings = {
      ...initialContext.globalSettings,
      navigation: 'tab',
      waste: {
        streetId: 2,
        streetName: 'Other Street (12345 Berlin)',
        selectedTypeKeys: []
      }
    };
    let tree;

    mockGetInAppPermission.mockResolvedValue(false);
    mockGetLocalNotificationPermission.mockResolvedValue(true);
    mockReadWasteReminderLocalState.mockResolvedValue(undefined);

    await act(async () => {
      tree = renderer.create(
        <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
          <WasteCollectionSettingsScreen />
        </SettingsContext.Provider>
      );
    });

    const renderedText = collectText(tree.toJSON()).join(' ');

    expect(renderedText).toContain('Notifications switch:on:disabled');
    expect(renderedText).toContain('Paper switch:on:disabled');
    expect(renderedText).toContain('Days before');
    expect(renderedText).toContain('2 days before');
    expect(renderedText).toContain('09:00');
  });
});
