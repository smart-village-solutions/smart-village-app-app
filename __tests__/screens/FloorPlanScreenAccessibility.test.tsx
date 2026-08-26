/* eslint-disable @typescript-eslint/no-var-requires */
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { AccessibilityInfo } from 'react-native';

jest.mock('../../src/hooks', () => ({
  useStaticContent: () => ({ data: undefined, error: false, loading: false })
}));

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');
  const { texts } = jest.requireActual('../../src/config/texts');
  const MockIcon = () => ReactLocal.createElement('mock-icon');

  return {
    consts: { a11yLabel: { closeIcon: 'Schließen (Taste)' } },
    Icon: { Close: MockIcon, List: MockIcon, Map: MockIcon },
    normalize: (value: number) => value,
    texts
  };
});

jest.mock('../../src/components', () => {
  const ReactLocal = require('react');
  const {
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    View: MockView
  } = require('react-native');

  return {
    Button: ({ accessibilityLabel, onPress, title, ...props }) =>
      ReactLocal.createElement(
        MockTouchableOpacity,
        {
          ...props,
          accessibilityLabel,
          accessibilityRole: 'button',
          onPress
        },
        ReactLocal.createElement(MockText, null, title)
      ),
    EmptyMessage: ({ title }) => ReactLocal.createElement(MockText, null, title),
    HeaderLeft: ({ backImage, onPress, text }) =>
      ReactLocal.createElement(
        MockTouchableOpacity,
        {
          accessibilityLabel: text || 'Zurück',
          accessibilityRole: 'button',
          onPress,
          testID: 'header-left'
        },
        backImage ? backImage({ tintColor: '#000000' }) : null
      ),
    LoadingSpinner: () => ReactLocal.createElement(MockView, { testID: 'loading-spinner' })
  };
});

jest.mock('../../src/components/floorPlan', () => {
  const ReactLocal = require('react');
  const { TouchableOpacity: MockTouchableOpacity, View: MockView } = require('react-native');

  return {
    FloorPlanPinList: () =>
      ReactLocal.createElement(MockView, {
        accessibilityRole: 'list',
        testID: 'floor-plan-list'
      }),
    FloorPlanPinPreview: () => null,
    FloorPlanView: ({ floors, onFloorSelect }) =>
      ReactLocal.createElement(
        MockView,
        { testID: 'floor-plan-view' },
        ReactLocal.createElement(MockTouchableOpacity, {
          accessibilityLabel: 'Obergeschoss auswählen',
          accessibilityRole: 'button',
          onPress: () => onFloorSelect(floors[1]?.id)
        })
      ),
    getValidFloorPlanPins: (pins) => pins,
    parseFloorPlanConfig: (config) => config
  };
});

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { FloorPlanConfig } from '../../src/components/floorPlan/types';
import { FloorPlanScreen } from '../../src/screens/FloorPlan/FloorPlanScreen';

const floorPlanConfig: FloorPlanConfig = {
  floors: [
    {
      id: 'ground-floor',
      pins: [{ id: 'entrance', title: 'Eingang', x: 10, y: 10 }],
      svgXml: '<svg />',
      title: 'Erdgeschoss',
      viewBox: { height: 100, width: 100, x: 0, y: 0 }
    },
    {
      id: 'first-floor',
      pins: [],
      svgXml: '<svg />',
      title: 'Obergeschoss',
      viewBox: { height: 100, width: 100, x: 0, y: 0 }
    }
  ],
  id: 'town-hall',
  initialViewMode: 'svg',
  title: 'Rathaus'
};

const createNavigation = () => ({
  goBack: jest.fn(),
  setOptions: jest.fn()
});

const renderScreen = (isScreenReaderEnabled: boolean) => {
  const navigation = createNavigation();
  const result = render(
    <AccessibilityContext.Provider value={{ isScreenReaderEnabled } as never}>
      <FloorPlanScreen
        navigation={navigation as never}
        route={{ key: 'floor-plan', name: 'FloorPlan', params: { floorPlanConfig } } as never}
      />
    </AccessibilityContext.Provider>
  );

  return { navigation, ...result };
};

describe('FloorPlanScreen accessibility', () => {
  let announceSpy: jest.SpyInstance;

  beforeEach(() => {
    announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    announceSpy.mockRestore();
  });

  it('uses the list alternative by default when a screen reader is enabled', () => {
    const { getByLabelText, getByTestId, queryByTestId } = renderScreen(true);

    expect(getByTestId('floor-plan-list')).toBeDefined();
    expect(queryByTestId('floor-plan-view')).toBeNull();
    expect(getByLabelText('Planansicht öffnen').props.accessibilityHint).toBe(
      'Zeigt den interaktiven Lageplan.'
    );
  });

  it('offers an accessible list action from the visual plan', () => {
    const { getByLabelText, getByTestId, navigation } = renderScreen(false);

    expect(getByTestId('floor-plan-view')).toBeDefined();

    fireEvent.press(getByLabelText('Listenansicht öffnen'));

    expect(getByTestId('floor-plan-list')).toBeDefined();
    expect(announceSpy).toHaveBeenCalledWith('Listenansicht öffnen');

    const headerLeft = navigation.setOptions.mock.calls.at(-1)?.[0].headerLeft;
    const { getByTestId: getHeaderByTestId } = render(headerLeft());

    expect(getHeaderByTestId('header-left').props.accessibilityLabel).toBe('Schließen (Taste)');
  });

  it('announces the selected floor after the plan remounts', () => {
    const { getByLabelText } = renderScreen(false);

    fireEvent.press(getByLabelText('Obergeschoss auswählen'));

    expect(announceSpy).toHaveBeenCalledWith('Obergeschoss ausgewählt.');
  });
});
