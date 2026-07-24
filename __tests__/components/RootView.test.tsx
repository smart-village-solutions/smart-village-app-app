import React from 'react';
import { View } from 'react-native';
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
  fontConfig: {}
}));

jest.mock('../../src/screens', () => ({
  SUE_REPORT_VALUES: 'sueReportValues'
}));

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import RootView from '../../src/RootView';

const renderRootView = (isGrayscaleEnabled: boolean) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(
      <AccessibilityContext.Provider value={{ isGrayscaleEnabled } as never}>
        <RootView>
          <View testID="child" />
        </RootView>
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
        <AccessibilityContext.Provider value={{ isGrayscaleEnabled: true } as never}>
          <RootView>
            <View testID="child" />
          </RootView>
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
});
