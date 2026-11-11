import { act, render } from '@testing-library/react-native';
import React from 'react';
import { Dimensions, PixelRatio, StyleSheet } from 'react-native';

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { Switch } from '../../src/components/Switch';

jest.mock('../../src/config', () => ({
  device: { platform: 'ios', isTablet: false },
  normalize: jest.requireActual('../../src/config/normalize').normalize
}));
jest.mock('../../src/AccessibilityProvider', () => ({
  AccessibilityContext: jest.requireActual('react').createContext({})
}));
jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#005295',
      gray40: '#DBDBE6',
      gray60: '#BCBBC1',
      onPrimary: '#FFFFFF',
      transparent: 'transparent'
    }
  })
}));

const initialWindow = Dimensions.get('window');
const initialScreen = Dimensions.get('screen');
const hairlineDescriptor = Object.getOwnPropertyDescriptor(StyleSheet, 'hairlineWidth');

beforeAll(() => {
  Object.defineProperty(StyleSheet, 'hairlineWidth', {
    configurable: true,
    get: () => Math.round(0.4 * PixelRatio.get()) / PixelRatio.get() || 1 / PixelRatio.get()
  });
});
afterAll(() => {
  Object.defineProperty(StyleSheet, 'hairlineWidth', hairlineDescriptor);
  Dimensions.set({ window: initialWindow, screen: initialScreen });
});

const setWindow = (width, height, scale) => {
  const dimensions = { width, height, scale, fontScale: 1 };
  act(() => Dimensions.set({ window: dimensions, screen: dimensions }));
};

const switchAt = (switchValue) => (
  <AccessibilityContext.Provider
    value={{ features: { switchLabels: true }, isReduceMotionEnabled: true }}
  >
    <Switch accessibilityLabel="Test switch" switchValue={switchValue} toggleSwitch={jest.fn()} />
  </AccessibilityContext.Provider>
);

const expectCenteredThumb = (view, enabled) => {
  const track = StyleSheet.flatten(view.getByTestId('switch-track').props.style);
  const thumb = StyleSheet.flatten(view.getByTestId('switch-thumb').props.style);
  const translation = thumb.transform[0].translateX;
  const left = track.borderWidth + thumb.left + translation;
  const top = track.borderWidth + thumb.top;
  const gap = (track.height - thumb.height) / 2;

  expect(thumb.width).toBe(thumb.height);
  expect(thumb.borderRadius).toBe(thumb.height / 2);
  expect(top).toBeCloseTo(gap);
  expect(track.height - top - thumb.height).toBeCloseTo(gap);
  expect(enabled ? track.width - left - thumb.width : left).toBeCloseTo(gap);
  expect(view.getByRole('switch').props.accessibilityState.checked).toBe(enabled);
  return track.width;
};

it.each([
  [360, 780, 2],
  [393, 852, 3],
  [402, 874, 3],
  [428, 926, 3],
  [1032, 1376, 2],
  [1376, 1032, 2]
])('keeps equal thumb gaps at %s × %s and density %s', (width, height, density) => {
  setWindow(width, height, density);
  const view = render(switchAt(false));
  expectCenteredThumb(view, false);
  view.rerender(switchAt(true));
  expectCenteredThumb(view, true);
});

it('updates the track and thumb together when the desktop or tablet window resizes', () => {
  setWindow(480, 720, 2);
  const view = render(switchAt(true));
  const initialWidth = expectCenteredThumb(view, true);
  setWindow(900, 1000, 2);
  expect(expectCenteredThumb(view, true)).toBeGreaterThan(initialWidth);
  view.rerender(switchAt(false));
  expectCenteredThumb(view, false);
});
