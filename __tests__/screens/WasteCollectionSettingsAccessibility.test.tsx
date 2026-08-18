import React from 'react';
import renderer from 'react-test-renderer';

const mockUsedTypes = {
  paper: {
    color: '#4477ff',
    label: 'Altpapier',
    selected_color: '#4477ff'
  },
  residual: {
    color: '#111111',
    label: 'Restabfall',
    selected_color: '#111111'
  }
};

const mockWasteStreetData = {
  wasteAddresses: [{ city: 'Magdeburg', street: 'Musterstrasse', zip: '39104' }]
};

jest.mock('@react-native-community/datetimepicker', () => 'mock-date-time-picker');

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn()
  }),
  useRoute: () => ({
    params: {
      currentSelectedStreetId: 1
    }
  })
}));

jest.mock('react-native-collapsible', () => ({ children, collapsed }) => (collapsed ? null : children));

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');

  const ListItem = (props) => ReactLocal.createElement('mock-list-item', props, props.children);
  ListItem.Content = (props) => ReactLocal.createElement('mock-list-item-content', props, props.children);

  return {
    Divider: () => null,
    ListItem,
    Tooltip: ({ children }) => children
  };
});

jest.mock('../../src/components', () => {
  const ReactLocal = require('react');

  return {
    BoldText: ({ children, ...props }) => ReactLocal.createElement('mock-bold-text', props, children),
    Button: ({ title }) => ReactLocal.createElement('mock-button', { title }),
    Dot: ({ color }) => ReactLocal.createElement('mock-dot', { color }),
    LoadingSpinner: () => ReactLocal.createElement('mock-loading-spinner'),
    RegularText: ({ children, ...props }) =>
      ReactLocal.createElement('mock-regular-text', props, children),
    SafeAreaViewFlex: ({ children }) => ReactLocal.createElement('mock-safe-area', {}, children),
    Switch: (props) => ReactLocal.createElement('mock-switch', props),
    Wrapper: ({ children }) => ReactLocal.createElement('mock-wrapper', {}, children),
    WrapperHorizontal: ({ children }) =>
      ReactLocal.createElement('mock-wrapper-horizontal', {}, children),
    WrapperRow: ({ children, ...props }) =>
      ReactLocal.createElement('mock-wrapper-row', props, children),
    WrapperVertical: ({ children, ...props }) =>
      ReactLocal.createElement('mock-wrapper-vertical', props, children)
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    darkText: '#141414',
    refreshControl: '#107821',
    shadowRgba: 'rgba(0,0,0,0.2)',
    surface: '#ffffff'
  },
  consts: {
    a11yLabel: {
      button: '(Taste)'
    }
  },
  device: {
    platform: 'ios'
  },
  Icon: {
    Calendar: () => null,
    KeyboardArrowUpDown: () => null,
    Pencil: () => null
  },
  normalize: (value: number) => value,
  texts: {
    dateTimePicker: {
      cancel: 'Abbrechen',
      ok: 'OK'
    },
    wasteCalendar: {
      chooseCategory: 'Kategorien auswählen',
      daysBefore: 'Tag(e) vor Abholung',
      myLocation: 'Meine Straße',
      notifications: 'Benachrichtigungen',
      notificationsOn: 'Benachrichtigungen an',
      oneDayBefore: '1 Tag vorher',
      sameDay: 'selber Tag',
      save: 'Änderungen speichern',
      timeOfDay: 'Uhrzeit'
    }
  }
}));

jest.mock('../../src/helpers', () => ({
  formatTime: () => '09:00',
  storageHelper: {
    setGlobalSettings: jest.fn()
  }
}));

jest.mock('../../src/hooks', () => ({
  useFilterStreets: () => ({
    filterStreets: jest.fn(() => [])
  }),
  useRenderSuggestions: () => ({
    inputValue: '',
    renderSuggestion: jest.fn()
  }),
  useStreetString: () => ({
    getStreetString: () => 'Musterstrasse 1'
  }),
  useWasteAddresses: () => ({
    data: { wasteAddresses: [] },
    loading: false
  }),
  useWasteStreet: () => ({
    data: mockWasteStreetData,
    loading: false
  }),
  useWasteTypes: () => ({
    data: {},
    loading: false
  }),
  useWasteUsedTypes: () => mockUsedTypes
}));

jest.mock('../../src/jsonValidation', () => ({
  areValidReminderSettings: () => true
}));

jest.mock('../../src/pushNotifications', () => ({
  getInAppPermission: jest.fn(async () => true),
  getReminderSettings: jest.fn(async () => []),
  handleSystemPermissions: jest.fn(async () => true),
  showPermissionRequiredAlert: jest.fn(),
  updateWasteReminderSettings: jest.fn(async () => 'id-1')
}));

jest.mock('../../src/screens', () => ({
  getLocationData: () => ({ city: 'Magdeburg', street: 'Musterstrasse', zip: '39104' }),
  getPositionStyleByNavigation: () => ({ position: 'relative' })
}));

jest.mock('../../src/SettingsProvider', () => {
  const ReactLocal = require('react');

  return {
    SettingsContext: ReactLocal.createContext({
      globalSettings: {
        navigation: {},
        settings: {},
        waste: {}
      },
      setGlobalSettings: jest.fn()
    })
  };
});

import { WasteCollectionSettingsScreen } from '../../src/screens/WasteCollectionSettingsScreen';

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('WasteCollectionSettingsScreen accessibility', () => {
  it('places the accessible name on the switches instead of the surrounding rows', async () => {
    let testRenderer: renderer.ReactTestRenderer;

    await renderer.act(async () => {
      testRenderer = renderer.create(<WasteCollectionSettingsScreen />);
      await flushPromises();
    });

    const switches = testRenderer!.root.findAllByType('mock-switch');
    const switchRows = testRenderer!.root
      .findAllByType('mock-list-item')
      .filter((item) => item.findAllByType('mock-switch').length > 0);

    expect(switches.map((item) => item.props.accessibilityLabel)).toContain('Altpapier');
    expect(switches.map((item) => item.props.accessibilityLabel)).toContain('Benachrichtigungen an');
    expect(switchRows.some((item) => item.props.accessibilityLabel)).toBe(false);
    expect(switchRows.every((item) => item.props.accessible === false)).toBe(true);
  });
});
