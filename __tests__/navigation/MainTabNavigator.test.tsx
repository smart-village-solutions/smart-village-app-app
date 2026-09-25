/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { useTabRoutes } from '../../src/navigation/MainTabNavigator';

const mockUseStaticContent = jest.fn();
const mockDefaultTabs = [{ stackConfig: { initialRouteName: 'Home' } }];
const mockColors = {};

jest.mock('expo-router/js-tabs', () => ({
  createBottomTabNavigator: () => ({ Navigator: () => null, Screen: () => null })
}));
jest.mock('../../src/components', () => ({ LoadingSpinner: () => null }));
jest.mock('../../src/navigation/AppStackNavigator', () => ({
  createStackNavigatorResolver: () => () => null
}));
jest.mock('../../src/navigation/ThemeAwareBottomTabBar', () => ({
  renderThemeAwareBottomTabBar: () => null
}));
jest.mock('../../src/config/navigation/tabConfig', () => ({
  createDefaultTabNavigatorConfig: () => ({
    activeBackgroundColor: '#fff',
    activeTintColor: '#000',
    inactiveBackgroundColor: '#fff',
    inactiveTintColor: '#000',
    tabConfigs: mockDefaultTabs
  }),
  createDynamicTabConfig: jest.fn()
}));
jest.mock('../../src/hooks', () => ({
  useStaticContent: (...args: unknown[]) => mockUseStaticContent(...args),
  useTheme: () => ({ colors: mockColors, mode: 'light' })
}));

let latestRoutes: ReturnType<typeof useTabRoutes>;
const Probe = () => {
  const routes = useTabRoutes();
  React.useEffect(() => {
    latestRoutes = routes;
  }, [routes]);
  return null;
};

describe('useTabRoutes', () => {
  it('keeps the resolved tabs while their static content is refetched', async () => {
    mockUseStaticContent.mockReturnValue({ loading: false, data: undefined });
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<Probe />);
    });
    expect(latestRoutes.tabRoutes?.tabConfigs).toEqual(mockDefaultTabs);

    mockUseStaticContent.mockReturnValue({ loading: true, data: undefined });
    await act(async () => {
      tree.update(<Probe />);
    });
    expect(latestRoutes.loading).toBe(true);
    expect(latestRoutes.tabRoutes?.tabConfigs).toEqual(mockDefaultTabs);
  });
});
