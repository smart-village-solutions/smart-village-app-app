import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import renderer from 'react-test-renderer';

let mockKeyboardHeight = 0;

const mockRenderSuggestions = {
  setInputValue: jest.fn(),
  setInputValueCity: jest.fn(),
  setInputValueCitySelected: jest.fn()
};

const mockUsedTypes = {
  residual: { color: '#00aa00' }
};

const mockStreetData = {
  wasteAddresses: [{ city: 'X', street: 'Y', zip: 'Z' }]
};

jest.mock('react-native-gesture-handler', () => ({
  ScrollView: jest.requireActual('react-native').ScrollView
}));

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: jest.fn()
}));

jest.mock('../../src/helpers/calendarHelper', () => ({
  setupLocales: jest.fn()
}));

jest.mock('../../src/helpers', () => ({
  momentFormat: jest.fn(() => '2026-07-08'),
  parseListItemsFromQuery: jest.fn(() => []),
  resolveWasteMarkedDatesForDisplay: jest.fn((markedDates) => markedDates)
}));

jest.mock('../../src/components', () => {
  const ReactLocal = require('react');

  return {
    AccessibilityHeader: () => ReactLocal.createElement('mock-accessibility-header'),
    BoldText: () => null,
    Button: () => null,
    CalendarListToggle: () => null,
    DefaultKeyboardAvoidingView: ({ children, enabled }) =>
      ReactLocal.createElement('mock-keyboard-avoiding-view', { enabled }, children),
    DrawerHeader: () => ReactLocal.createElement('mock-drawer-header'),
    HeaderLeft: ({ backImage }) =>
      ReactLocal.createElement(
        'mock-header-left',
        {},
        backImage ? backImage({ tintColor: '#111111' }) : null
      ),
    LoadingSpinner: () => null,
    RegularText: () => null,
    renderArrow: jest.fn(),
    SafeAreaViewFlex: ({ children }) => children,
    WasteCalendarLegend: () => null,
    WasteHeader: () => null,
    WasteInputForm: () => null,
    WasteList: () => null,
    Wrapper: ({ children }) => children,
    WrapperRow: ({ children, style }) =>
      ReactLocal.createElement('mock-wrapper-row', { style }, children)
  };
});

jest.mock('../../src/components/DayComponent', () => ({
  DayComponent: () => null
}));

jest.mock('../../src/components/FeedbackFooter', () => ({
  FeedbackFooter: 'mock-feedback-footer'
}));

jest.mock('../../src/hooks', () => ({
  useKeyboardHeight: jest.fn(() => mockKeyboardHeight),
  useWasteStreetRehydration: jest.fn(),
  useWasteStreetEditRequest: jest.fn(),
  useRenderSuggestions: jest.fn(() => mockRenderSuggestions),
  useTriggerExport: jest.fn(() => ({
    triggerExport: jest.fn()
  })),
  useWasteMarkedDates: jest.fn(() => ({})),
  useWasteStreet: jest.fn(() => ({
    data: mockStreetData,
    loading: false
  })),
  useWasteTypes: jest.fn(() => ({
    data: mockUsedTypes,
    loading: false
  })),
  useWasteUsedTypes: jest.fn(() => mockUsedTypes)
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    WASTE_STREET: 'wasteStreet'
  }
}));

jest.mock('../../src/types', () => ({
  ScreenName: {
    WasteCollectionSettings: 'WasteCollectionSettings'
  }
}));

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  return {
    colors: {
      darkText: '#222222'
    },
    consts: {
      CALENDAR: {
        DOT_SIZE: 6
      },
      a11yLabel: {
        closeIcon: 'Schließen'
      }
    },
    device: {
      platform: 'ios'
    },
    Icon: {
      Close: () => null,
      EditSetting: (props: unknown) => ReactLocal.createElement('mock-edit-icon', props)
    },
    normalize: (value: number) => value,
    texts: {
      close: 'Schließen',
      wasteCalendar: {
        calendarIntro: 'Intro',
        exportButton: 'Export',
        hintCityAndStreet: 'Hint',
        hintStreet: 'Hint'
      }
    }
  };
});

import { device } from '../../src/config';
import { SettingsContext } from '../../src/SettingsProvider';
import { createStyles, WasteCollectionScreen } from '../../src/screens/WasteCollectionScreen';

describe('WasteCollectionScreen header', () => {
  it('uses the active theme surface for the calendar day overlay', () => {
    expect(createStyles({ surface: '#1E1E1E' }).overlay).toMatchObject({
      backgroundColor: '#1E1E1E'
    });
  });

  it('renders settings before accessibility and keeps drawer at the far right', () => {
    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      setOptions: jest.fn()
    };

    renderer.act(() => {
      renderer.create(
        <SettingsContext.Provider
          value={
            {
              globalSettings: {
                navigation: 'drawer',
                settings: {
                  wasteAddresses: {}
                },
                waste: {
                  streetId: 123,
                  selectedTypeKeys: []
                }
              }
            } as never
          }
        >
          <WasteCollectionScreen navigation={navigation as never} route={{} as never} />
        </SettingsContext.Provider>
      );
    });

    const headerRightConfig = navigation.setOptions.mock.calls.find(
      ([options]) => typeof options.headerRight === 'function'
    )?.[0];

    let headerTree: renderer.ReactTestRenderer;

    renderer.act(() => {
      headerTree = renderer.create(headerRightConfig.headerRight());
    });

    const renderedOrder = headerTree!.root.findAll(
      (node) => typeof node.type === 'string' && node.type.startsWith('mock-')
    );

    expect(renderedOrder.map((node) => node.type)).toEqual([
      'mock-wrapper-row',
      'mock-header-left',
      'mock-edit-icon',
      'mock-accessibility-header',
      'mock-drawer-header'
    ]);

    expect(headerTree!.root.findByType('mock-wrapper-row').props.style).toMatchObject({
      paddingRight: 8
    });
    expect(headerTree!.root.findByType('mock-edit-icon').props.size).toBe(20);
  });
});

describe('WasteCollectionScreen address form', () => {
  afterEach(() => {
    device.platform = 'ios';
    mockKeyboardHeight = 0;
  });

  const renderAddressForm = () => {
    let tree: renderer.ReactTestRenderer;
    renderer.act(() => {
      tree = renderer.create(
        <SettingsContext.Provider
          value={{ globalSettings: { navigation: 'tab', settings: {}, waste: {} } } as never}
        >
          <WasteCollectionScreen
            navigation={{ setOptions: jest.fn() } as never}
            route={{} as never}
          />
        </SettingsContext.Provider>
      );
    });
    return tree!;
  };

  it.each(['ios', 'android'])('uses one keyboard avoidance mechanism on %s', (platform) => {
    device.platform = platform;
    const tree = renderAddressForm();
    const avoidingView = tree.root.find((node) => node.type === 'mock-keyboard-avoiding-view');

    expect(avoidingView.props.enabled).toBe(platform === 'android');
    expect(avoidingView.findByType(ScrollView).props.automaticallyAdjustKeyboardInsets).toBe(
      platform === 'ios'
    );
  });

  it('reserves the address form viewport for suggestions while the keyboard is open', () => {
    const keyboardClosed = renderAddressForm();
    expect(
      keyboardClosed.root.findAll((node) => node.type === 'mock-feedback-footer')
    ).toHaveLength(1);

    mockKeyboardHeight = 202;
    const keyboardOpen = renderAddressForm();
    expect(keyboardOpen.root.findAll((node) => node.type === 'mock-feedback-footer')).toHaveLength(
      0
    );
  });
});
