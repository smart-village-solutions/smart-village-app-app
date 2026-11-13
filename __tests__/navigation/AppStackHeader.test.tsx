import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('expo-router/build/react-navigation/stack', () => {
  const ReactLocal = jest.requireActual('react');
  return {
    CardStyleInterpolators: {},
    createStackNavigator: () => ({
      Navigator: (props: object) => ReactLocal.createElement('mock-navigator', props),
      Screen: (props: object) => ReactLocal.createElement('mock-screen', props)
    })
  };
});

jest.mock('../../src/AccessibilityProvider', () => ({
  AccessibilityContext: jest.requireActual('react').createContext({ isReduceMotionEnabled: false })
}));
jest.mock('../../src/components/NavigationHeader', () => ({
  NavigationHeader: (props: object) =>
    jest.requireActual('react').createElement('mock-header', props)
}));

import { getStackNavigator } from '../../src/navigation/AppStackNavigator';
import { NavigationHeader } from '../../src/components/NavigationHeader';
import type { StackConfig } from '../../src/types';
import { ScreenName } from '../../src/types/Navigation';

const renderStack = (screenOptions = {}) => {
  const Stack = getStackNavigator({
    initialRouteName: ScreenName.About,
    screenOptions,
    screenConfigs: [{ routeName: ScreenName.About, screenComponent: () => null, screenOptions: {} }]
  } as StackConfig);
  let tree: renderer.ReactTestRenderer;
  renderer.act(() => {
    tree = renderer.create(<Stack />);
  });
  return tree!;
};

describe('stack header defaults', () => {
  it('wraps default and screen-installed controls in the shared header', () => {
    const tree = renderStack();
    const options = tree.root.findByType('mock-navigator' as never).props.screenOptions({});
    expect(options.header({}).type).toBe(NavigationHeader);
    const screenOptions = tree.root.findByType('mock-screen' as never).props.options({});
    expect(screenOptions.header).toBeUndefined();
  });

  it('preserves configured branded or custom header renderers', () => {
    const customHeader = jest.fn();
    const tree = renderStack({ header: customHeader });
    expect(tree.root.findByType('mock-navigator' as never).props.screenOptions({}).header).toBe(
      customHeader
    );
  });
});
