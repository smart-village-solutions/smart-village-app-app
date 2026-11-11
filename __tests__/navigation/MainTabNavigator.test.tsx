/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { MainTabNavigator, useTabRoutes } from '../../src/navigation/MainTabNavigator';

const mockUseStaticContent = jest.fn();
const mockUseTabNavigationTranslations = jest.fn((source: unknown) => source);
const mockStackMount = jest.fn();
const mockDefaultTabs = [{ stackConfig: { initialRouteName: 'Home' } }];
const mockColors = {};

jest.mock('expo-router/js-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: () => React.ReactNode }) => children()
  })
}));
jest.mock('../../src/components', () => ({ LoadingSpinner: () => null }));
jest.mock('../../src/navigation/AppStackNavigator', () => ({
  AppStackNavigator: () => {
    jest.requireActual('react').useEffect(() => {
      mockStackMount();
    }, []);
    return null;
  }
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
jest.mock('../../src/hooks/homeSettingsTranslations', () => ({
  useTabNavigationTranslations: (source: unknown) => mockUseTabNavigationTranslations(source)
}));
jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: jest.requireActual('react').createContext({ isMainserverUp: true })
}));

let latestRoutes: ReturnType<typeof useTabRoutes>;
const Probe = ({ translate = false }) => {
  const routes = useTabRoutes(translate);
  React.useEffect(() => {
    latestRoutes = routes;
  }, [routes]);
  return null;
};

describe('useTabRoutes', () => {
  beforeEach(() => {
    mockUseTabNavigationTranslations.mockImplementation((source: unknown) => source);
    mockStackMount.mockClear();
  });

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
    await act(async () => tree.unmount());
  });

  it('refreshes tab labels and the mounted stack header without resetting the route', async () => {
    const screen = { routeName: 'About', initialParams: { title: 'Rathaus' } };
    const source = {
      tabConfigs: [
        {
          tabOptions: { tabBarLabel: 'Mehr' },
          stackConfig: { initialRouteName: 'About', screenConfigs: [screen] }
        }
      ]
    };
    const translated = {
      tabConfigs: [
        {
          tabOptions: { tabBarLabel: 'More' },
          stackConfig: {
            initialRouteName: 'About',
            screenConfigs: [{ ...screen, initialParams: { title: 'Town hall' } }]
          }
        }
      ]
    };
    mockUseStaticContent.mockReturnValue({ loading: false, data: source });
    let tree: renderer.ReactTestRenderer;
    const Navigation = () => (
      <>
        <MainTabNavigator />
        <Probe translate />
      </>
    );
    await act(async () => {
      tree = renderer.create(<Navigation />);
    });

    mockUseTabNavigationTranslations.mockReturnValue(translated);
    await act(async () => tree.update(<Navigation />));
    const tab = latestRoutes.tabRoutes?.tabConfigs[0];
    if (!tab || typeof tab === 'string' || !('stackConfig' in tab)) {
      throw new Error('expected a configured tab');
    }
    const localizedScreen = tab.stackConfig.screenConfigs[0];
    expect(mockStackMount).toHaveBeenCalledTimes(1);
    expect(tab.tabOptions).toEqual({ tabBarLabel: 'More' });
    expect(localizedScreen.initialParams).toMatchObject(screen.initialParams);
    expect(typeof localizedScreen.screenOptions).toBe('function');
    if (typeof localizedScreen.screenOptions !== 'function') throw new Error('expected options');
    expect(
      localizedScreen.screenOptions({
        navigation: {},
        route: { name: 'About', key: 'about', params: { title: 'Rathaus' } }
      })
    ).toEqual({ title: 'Town hall' });
    expect(
      localizedScreen.screenOptions({
        navigation: {},
        route: { name: 'About', key: 'about', params: { title: 'Explicit route title' } }
      })
    ).toEqual({});

    const refreshedConfig = (label: string, title: string) => ({
      tabConfigs: [
        {
          tabOptions: { tabBarLabel: label },
          stackConfig: {
            initialRouteName: 'About',
            screenConfigs: [{ ...screen, initialParams: { title } }]
          }
        }
      ]
    });
    mockUseStaticContent.mockReturnValue({
      loading: false,
      data: refreshedConfig('Stadtinfo', 'Stadtverwaltung')
    });
    mockUseTabNavigationTranslations.mockReturnValue(refreshedConfig('City info', 'City council'));
    await act(async () => tree.update(<Navigation />));
    const refreshedTab = latestRoutes.tabRoutes?.tabConfigs[0];
    const options = refreshedTab?.stackConfig.screenConfigs[0].screenOptions;
    expect(mockStackMount).toHaveBeenCalledTimes(1);
    expect(refreshedTab?.tabOptions).toEqual({ tabBarLabel: 'City info' });
    if (typeof options !== 'function') throw new Error('expected refreshed options');
    expect(
      options({
        navigation: {},
        route: { name: 'About', key: 'about', params: localizedScreen.initialParams }
      })
    ).toEqual({ title: 'City council' });
    await act(async () => tree.unmount());
  });
});
