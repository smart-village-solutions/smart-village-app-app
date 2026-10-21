import { createStackNavigator } from 'expo-router/build/react-navigation/stack';
import React from 'react';
import renderer from 'react-test-renderer';

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { getStackNavigator } from '../../src/navigation/AppStackNavigator';

jest.mock('expo-router/build/react-navigation/stack', () => {
  const Screen = () => null;
  return {
    createStackNavigator: () => ({ Navigator: 'StackNavigator', Screen }),
    CardStyleInterpolators: { forNoAnimation: jest.fn() }
  };
});

jest.mock('../../src/AccessibilityProvider', () => ({
  AccessibilityContext: jest
    .requireActual('react')
    .createContext({ textScaleMultiplier: 1, isReduceMotionEnabled: false })
}));

jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));

it('protects every stack screen horizontally and forwards navigation props', () => {
  const Screen = () => null;
  const Stack = getStackNavigator({
    initialRouteName: 'Home',
    screenConfigs: ['Home', 'Events', 'Service', 'Detail'].map((routeName) => ({
      routeName,
      screenComponent: Screen
    }))
  });
  let tree;
  renderer.act(() => {
    tree = renderer.create(<Stack />);
  });
  const screens = tree.root.findAllByType(createStackNavigator().Screen);
  expect(screens).toHaveLength(4);
  screens.forEach((screen) => {
    const props = { route: { name: screen.props.name }, navigation: {} };
    const wrapped = screen.props.children(props);
    expect(wrapped.type).toBe('SafeAreaView');
    expect(wrapped.props.edges).toEqual(['left', 'right']);
    const content = wrapped.props.children.props.children;
    expect(content.type).toBe(Screen);
    expect(content.props).toEqual(props);
  });
  renderer.act(() => tree.unmount());
});

it('preserves reduced-motion settings for the navigator and individual screens', () => {
  const Stack = getStackNavigator({
    initialRouteName: 'Home',
    screenOptions: () => ({ animationEnabled: true, gestureEnabled: true }),
    screenConfigs: [
      {
        routeName: 'Home',
        screenComponent: () => null,
        screenOptions: () => ({ animationEnabled: true, gestureEnabled: true })
      }
    ]
  });
  let tree;
  renderer.act(() => {
    tree = renderer.create(
      <AccessibilityContext.Provider value={{ isReduceMotionEnabled: true }}>
        <Stack />
      </AccessibilityContext.Provider>
    );
  });
  expect(tree.root.findByType('StackNavigator').props.screenOptions({})).toMatchObject({
    animationEnabled: false,
    gestureEnabled: false
  });
  expect(tree.root.findByType(createStackNavigator().Screen).props.options({})).toMatchObject({
    animationEnabled: false,
    gestureEnabled: false
  });
  renderer.act(() => tree.unmount());
});
