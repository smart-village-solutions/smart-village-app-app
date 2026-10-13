import { createBottomTabNavigator } from 'expo-router/js-tabs';
import React from 'react';
import renderer from 'react-test-renderer';

import { OrientationContext } from '../../src/OrientationProvider';
import { MainTabNavigator } from '../../src/navigation/MainTabNavigator';

const mockColors = {};
const mockRoutes = {
  tabConfigs: [{ stackConfig: { initialRouteName: 'Home' } }]
};
jest.mock('expo-router/js-tabs', () => {
  const Screen = () => null;
  return { createBottomTabNavigator: () => ({ Navigator: 'Tabs', Screen }) };
});
jest.mock('../../src/components', () => ({ LoadingSpinner: () => null }));
jest.mock('../../src/hooks', () => ({
  useStaticContent: () => ({ data: mockRoutes, loading: false }),
  useTheme: () => ({ colors: mockColors, mode: 'light' })
}));
jest.mock('../../src/config/navigation/tabConfig', () => ({
  createDefaultTabNavigatorConfig: () => mockRoutes
}));
jest.mock('../../src/config', () => ({ consts: { REFRESH_INTERVALS: {} } }));
jest.mock('../../src/navigation/ThemeAwareBottomTabBar', () => ({
  renderThemeAwareBottomTabBar: () => null
}));
jest.mock('expo-router/build/react-navigation/stack', () => ({ createStackNavigator: () => ({}) }));

jest.mock('../../src/AccessibilityProvider', () => ({
  AccessibilityContext: jest
    .requireActual('react')
    .createContext({ textScaleMultiplier: 1, isReduceMotionEnabled: false })
}));

jest.mock('../../src/types', () => ({}));

it('preserves the stack component when rotating or opening the keyboard', () => {
  let tree;
  const render = (orientation, width, height) => (
    <OrientationContext.Provider value={{ orientation, dimensions: { width, height } }}>
      <MainTabNavigator />
    </OrientationContext.Provider>
  );
  renderer.act(() => {
    tree = renderer.create(render('portrait', 402, 874));
  });
  const getStack = () => tree.root.findByType(createBottomTabNavigator().Screen).props.component;
  const initialStack = getStack();
  renderer.act(() => tree.update(render('landscape', 874, 402)));
  expect(getStack()).toBe(initialStack);
  renderer.act(() => tree.update(render('portrait', 402, 300)));
  expect(getStack()).toBe(initialStack);
  renderer.act(() => tree.unmount());
});
