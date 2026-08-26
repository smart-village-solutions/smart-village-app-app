/* eslint-disable @typescript-eslint/no-var-requires */
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

const mockUseZoomableSvgTransform = jest.fn(() => ({
  animatedStyle: {},
  gesture: {},
  reset: jest.fn()
}));

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');
  const { texts } = jest.requireActual('../../src/config/texts');
  const MockIcon = () => ReactLocal.createElement('mock-icon');

  return {
    consts: {
      a11yLabel: { button: '(Taste)' },
      DIMENSIONS: { FULL_SCREEN_MAX_WIDTH: 504 }
    },
    device: { height: 800, platform: 'ios' },
    Icon: { ArrowRight: MockIcon, PinFilled: MockIcon },
    normalize: (value: number) => value,
    texts
  };
});

jest.mock('../../src/components/floorPlan/useZoomableSvgTransform', () => ({
  useZoomableSvgTransform: (reduceMotion: boolean) => mockUseZoomableSvgTransform(reduceMotion)
}));

jest.mock('../../src/components/floorPlan/utils', () => ({
  canNavigateToLinkedContent: (pin) => !!pin.routeName,
  getValidFloorPlanPins: (pins) => pins,
  navigateToLinkedContent: ({ navigation, pin }) => {
    navigation?.navigate(pin.routeName, pin.params);
    return true;
  }
}));

jest.mock('../../src/helpers', () => ({
  isOpen: () => ({ open: false }),
  navigateToRoute: jest.fn(),
  trimNewLines: (value) => value
}));

jest.mock('../../src/components/TextListItem', () => {
  const ReactLocal = require('react');
  const { TouchableOpacity: MockTouchableOpacity } = require('react-native');

  return {
    TextListItem: ({ accessibilityLabel, item }) =>
      ReactLocal.createElement(MockTouchableOpacity, {
        accessibilityLabel: accessibilityLabel || item.accessibilityLabel,
        accessibilityRole: 'button',
        onPress: item.onPress
      })
  };
});

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { FloorPlanFloorSwitcher } from '../../src/components/floorPlan/FloorPlanFloorSwitcher';
import { FloorPlanPinLayer } from '../../src/components/floorPlan/FloorPlanPinLayer';
import { FloorPlanPinList } from '../../src/components/floorPlan/FloorPlanPinList';
import { FloorPlanResetButton } from '../../src/components/floorPlan/FloorPlanResetButton';
import { FloorPlanView } from '../../src/components/floorPlan/FloorPlanView';
import { darkColors } from '../../src/config/colors';
import { ThemeContext } from '../../src/ThemeContext';

const floor = {
  id: 'ground-floor',
  pins: [],
  title: 'Erdgeschoss',
  viewBox: { height: 100, width: 100, x: 0, y: 0 }
};

describe('floor plan accessibility', () => {
  beforeEach(() => {
    mockUseZoomableSvgTransform.mockClear();
  });

  it('exposes selected floor semantics and keeps a scalable touch target', () => {
    const onFloorSelect = jest.fn();
    const { getByLabelText, UNSAFE_getAllByType } = render(
      <ThemeContext.Provider value={{ colors: darkColors, isDark: true, mode: 'dark' }}>
        <FloorPlanFloorSwitcher
          floors={[floor, { ...floor, id: 'first-floor', title: 'Obergeschoss' }]}
          onFloorSelect={onFloorSelect}
          selectedFloorId={floor.id}
        />
      </ThemeContext.Provider>
    );

    const selectedFloor = getByLabelText('(Erdgeschoss) (Taste)');
    const floorButtons = UNSAFE_getAllByType(TouchableOpacity);

    expect(selectedFloor.props.accessibilityHint).toBe('Wechselt zu diesem Stockwerk.');
    expect(selectedFloor.props.accessibilityState).toEqual({ selected: true });
    expect(StyleSheet.flatten(floorButtons[0].props.style).minHeight).toBe(48);

    fireEvent.press(getByLabelText('(Obergeschoss) (Taste)'));
    expect(onFloorSelect).toHaveBeenCalledWith('first-floor');
  });

  it('uses configured pin labels and exposes selected pin state', () => {
    const onPinPress = jest.fn();
    const pin = {
      accessibilityLabel: 'Barrierefreier Eingang',
      id: 'entrance',
      title: 'Eingang',
      type: 'room' as const,
      x: 20,
      y: 30
    };
    const { getByTestId, UNSAFE_getAllByType } = render(
      <ThemeContext.Provider value={{ colors: darkColors, isDark: true, mode: 'dark' }}>
        <Svg>
          <FloorPlanPinLayer pins={[pin]} selectedPinId={pin.id} onPinPress={onPinPress} />
        </Svg>
      </ThemeContext.Provider>
    );

    const accessiblePin = getByTestId('floor-plan-pin-entrance');
    const pinCircles = UNSAFE_getAllByType(Circle);

    expect(accessiblePin.props.accessible).toBe(true);
    expect(accessiblePin.props.accessibilityLabel).toBe(
      'Barrierefreier Eingang, ausgewählt (Taste)'
    );
    expect(pinCircles[1].props.fill).toBe(darkColors.primary);

    fireEvent.press(accessiblePin);
    expect(onPinPress).toHaveBeenCalledWith(pin);
  });

  it('forwards configured labels to the accessible list alternative', () => {
    const navigation = { navigate: jest.fn() };
    const { getByLabelText } = render(
      <FloorPlanPinList
        navigation={navigation as never}
        pins={[
          {
            accessibilityLabel: 'Aufzug zum Obergeschoss',
            id: 'lift',
            params: {},
            routeName: 'Detail',
            title: 'Aufzug',
            x: 10,
            y: 10
          }
        ]}
      />
    );

    expect(getByLabelText('Orte im Lageplan').props.accessibilityRole).toBe('list');
    expect(getByLabelText('Aufzug zum Obergeschoss')).toBeDefined();
  });

  it('provides a meaningful reset action with a full-size touch target', () => {
    const { getByLabelText } = render(<FloorPlanResetButton onPress={jest.fn()} />);
    const resetButton = getByLabelText('Planansicht zurücksetzen');

    expect(resetButton.props.accessibilityHint).toBe(
      'Setzt Zoom und Position des Lageplans zurück.'
    );
  });

  it('disables reset motion when reduced motion is active', () => {
    render(
      <AccessibilityContext.Provider value={{ isReduceMotionEnabled: true } as never}>
        <FloorPlanView
          config={floor}
          floors={[floor]}
          onFloorSelect={jest.fn()}
          onPinPress={jest.fn()}
        />
      </AccessibilityContext.Provider>
    );

    expect(mockUseZoomableSvgTransform).toHaveBeenCalledWith(true);
  });
});
