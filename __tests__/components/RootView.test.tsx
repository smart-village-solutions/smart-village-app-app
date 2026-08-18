/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { StatusBar, View } from 'react-native';
import renderer from 'react-test-renderer';

const mockRemoveItem = jest.fn();
const mockHideAsync = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: (...args: unknown[]) => mockRemoveItem(...args)
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true]
}));

jest.mock('expo-splash-screen', () => ({
  hideAsync: (...args: unknown[]) => mockHideAsync(...args)
}));

jest.mock('../../src/components/AppWideGrayscaleFilter', () => ({
  AppWideGrayscaleFilter: ({ children, ...props }: { children: React.ReactNode }) => {
    const ReactLocal = require('react');

    return ReactLocal.createElement('mock-grayscale-filter', props, children);
  }
}));

jest.mock('../../src/AccessibilityProvider', () => {
  const ReactLocal = require('react');

  return {
    AccessibilityContext: ReactLocal.createContext({
      isGrayscaleEnabled: false
    })
  };
});

jest.mock('../../src/config', () => ({
  fontConfig: {},
  SUE_REPORT_VALUES: 'sueReportValues'
}));

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { darkColors, lightColors } from '../../src/config/colors';
import RootView from '../../src/RootView';
import { ThemeContext } from '../../src/ThemeContext';

const renderRootView = (
  isGrayscaleEnabled: boolean,
  mode: 'dark' | 'light' = 'light',
  isHydrated = true
) => {
  let testRenderer: renderer.ReactTestRenderer;
  const colors = mode === 'dark' ? darkColors : lightColors;

  renderer.act(() => {
    testRenderer = renderer.create(
      <AccessibilityContext.Provider
        value={{ features: { theming: true }, isGrayscaleEnabled, isHydrated } as never}
      >
        <ThemeContext.Provider value={{ colors, isDark: mode === 'dark', mode }}>
          <RootView>
            <View testID="child" />
          </RootView>
        </ThemeContext.Provider>
      </AccessibilityContext.Provider>
    );
  });

  return testRenderer!;
};

describe('RootView', () => {
  beforeEach(() => {
    mockRemoveItem.mockClear();
    mockHideAsync.mockClear();
  });

  it('runs startup layout side effects only once even if grayscale toggles trigger re-layout', async () => {
    const tree = renderRootView(false);
    const rootView = tree.root.findAllByType(View)[0];

    await renderer.act(async () => {
      await rootView.props.onLayout();
    });

    await renderer.act(async () => {
      tree.update(
        <AccessibilityContext.Provider
          value={
            { features: { theming: true }, isGrayscaleEnabled: true, isHydrated: true } as never
          }
        >
          <ThemeContext.Provider value={{ colors: lightColors, isDark: false, mode: 'light' }}>
            <RootView>
              <View testID="child" />
            </RootView>
          </ThemeContext.Provider>
        </AccessibilityContext.Provider>
      );
    });

    const updatedRootView = tree.root.findAllByType(View)[0];

    await renderer.act(async () => {
      await updatedRootView.props.onLayout();
    });

    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith('sueReportValues');
    expect(mockHideAsync).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['dark', 'light-content'],
    ['light', 'dark-content']
  ] as const)('uses the %s root surface for status bar contrast', (mode, expectedBarStyle) => {
    const tree = renderRootView(false, mode);

    expect(tree.root.findByType(StatusBar).props.barStyle).toBe(expectedBarStyle);
  });

  it('keeps the splash visible until the saved theme has hydrated and the root has laid out', async () => {
    const tree = renderRootView(false, 'dark', false);

    expect(tree.toJSON()).toBeNull();
    expect(mockHideAsync).not.toHaveBeenCalled();

    await renderer.act(async () => {
      tree.update(
        <AccessibilityContext.Provider
          value={
            { features: { theming: true }, isGrayscaleEnabled: false, isHydrated: true } as never
          }
        >
          <ThemeContext.Provider value={{ colors: darkColors, isDark: true, mode: 'dark' }}>
            <RootView>
              <View testID="child" />
            </RootView>
          </ThemeContext.Provider>
        </AccessibilityContext.Provider>
      );
    });

    const rootView = tree.root.findAllByType(View)[0];

    await renderer.act(async () => {
      await rootView.props.onLayout();
    });

    expect(mockHideAsync).toHaveBeenCalledTimes(1);
    expect(tree.root.findByType(StatusBar).props.barStyle).toBe('light-content');
  });
});
