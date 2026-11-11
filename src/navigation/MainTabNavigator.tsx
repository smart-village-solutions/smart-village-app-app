/* eslint-disable complexity */
import { createBottomTabNavigator } from 'expo-router/js-tabs';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import { LoadingSpinner } from '../components';
import { consts } from '../config';
import {
  createDefaultTabNavigatorConfig,
  createDynamicTabConfig
} from '../config/navigation/tabConfig';
import { resolveTabBarColors } from '../helpers/tabNavigationHelper';
import { useStaticContent, useTheme } from '../hooks';
import { useTabNavigationTranslations } from '../hooks/homeSettingsTranslations';
import { NetworkContext } from '../NetworkProvider';
import { OrientationContext } from '../OrientationProvider';
import {
  CustomTab,
  ScreenConfig,
  TabConfig,
  TabNavigationStaticContent,
  TabNavigatorConfig
} from '../types';

import { AppStackNavigator } from './AppStackNavigator';
import { renderThemeAwareBottomTabBar } from './ThemeAwareBottomTabBar';

const { REFRESH_INTERVALS } = consts;

const isTabConfig = (
  tabConfig: CustomTab | TabConfig | string | undefined
): tabConfig is TabConfig =>
  !!tabConfig && typeof tabConfig !== 'string' && 'stackConfig' in tabConfig;

const initialTitle = (screen?: ScreenConfig) =>
  (screen?.initialParams as { title?: unknown } | undefined)?.title;

const withTranslatedTitle = (
  screen: ScreenConfig,
  original: unknown,
  translated: unknown
): ScreenConfig => {
  if (typeof original !== 'string' || typeof translated !== 'string' || original === translated) {
    return screen;
  }

  const { screenOptions } = screen;
  return {
    ...screen,
    // initialParams only seeds the route on mount, so update the header via options.
    screenOptions: (props) => ({
      ...(typeof screenOptions === 'function' ? screenOptions(props) : screenOptions),
      ...((props.route.params as { title?: string } | undefined)?.title === original && {
        title: translated
      })
    })
  };
};

export const useTabRoutes = (translate = false) => {
  const { colors, mode } = useTheme();
  const { isMainserverUp } = useContext(NetworkContext);
  const defaultTabRoutes = useMemo(() => createDefaultTabNavigatorConfig(colors), [colors]);
  const [lastTabRoutes, setLastTabRoutes] = useState<TabNavigatorConfig>();
  const { data: tabRoutesData, loading } = useStaticContent<TabNavigationStaticContent>({
    name: 'tabNavigation',
    refreshInterval: REFRESH_INTERVALS.ONCE_PER_MINUTE,
    type: 'json'
  });
  const translatedRoutes = useTabNavigationTranslations(
    translate ? tabRoutesData : undefined,
    isMainserverUp
  ) as typeof tabRoutesData;

  const freshTabRoutes = useMemo(() => {
    const { tabConfigs } = tabRoutesData || defaultTabRoutes;
    const tabBarColors = resolveTabBarColors(defaultTabRoutes, tabRoutesData, mode);
    const defaultIconFillOnFocus = tabRoutesData?.tabBarIconFillOnFocus ?? false;
    const configuredDefaultTabRoutes = createDefaultTabNavigatorConfig(
      colors,
      defaultIconFillOnFocus
    );

    const dynamicTabs = (tabConfigs as (CustomTab | TabConfig | string)[])?.map(
      (tabConfig, index) => {
        if (typeof tabConfig === 'string') {
          // Here we compare default tabs with the array on main-server. A matching
          // initial route automatically selects the themed default tab definition.
          return configuredDefaultTabRoutes.tabConfigs.find(
            (defaultTab): defaultTab is TabConfig =>
              typeof defaultTab !== 'string' &&
              'stackConfig' in defaultTab &&
              defaultTab.stackConfig.initialRouteName === tabConfig
          );
        } else if ('stackConfig' in tabConfig) {
          const translated = translatedRoutes?.tabConfigs[index];
          if (!isTabConfig(translated) || translated === tabConfig) return tabConfig;

          return {
            tabOptions: translated.tabOptions,
            stackConfig: {
              ...tabConfig.stackConfig,
              screenConfigs: tabConfig.stackConfig.screenConfigs.map((screen, screenIndex) =>
                withTranslatedTitle(
                  screen,
                  initialTitle(screen),
                  initialTitle(translated.stackConfig.screenConfigs[screenIndex])
                )
              )
            }
          };
        } else {
          const translated = translatedRoutes?.tabConfigs[index] as CustomTab | undefined;
          const config = createDynamicTabConfig({
            ...tabConfig,
            label: translated?.label ?? tabConfig.label,
            accessibilityLabel: translated?.accessibilityLabel ?? tabConfig.accessibilityLabel,
            colors,
            index,
            tabBarIconFillOnFocus: tabConfig.tabBarIconFillOnFocus ?? defaultIconFillOnFocus,
            themeMode: mode,
            totalCount: tabConfigs.length
          });
          if (!translated || translated === tabConfig) return config;

          return {
            ...config,
            stackConfig: {
              ...config.stackConfig,
              screenConfigs: config.stackConfig.screenConfigs.map((screen) =>
                screen.routeName === config.stackConfig.initialRouteName
                  ? withTranslatedTitle(screen, tabConfig.params?.title, translated.params?.title)
                  : screen
              )
            }
          };
        }
      }
    );

    return {
      ...tabBarColors,
      tabConfigs: dynamicTabs.filter(isTabConfig)
    };
  }, [colors, defaultTabRoutes, mode, tabRoutesData, translatedRoutes]);

  useEffect(() => {
    // Keep the navigator mounted when a background tab configuration request starts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!loading) setLastTabRoutes(freshTabRoutes);
  }, [freshTabRoutes, loading]);

  const tabRoutes = loading ? lastTabRoutes : freshTabRoutes;

  return { defaultTabRoutes, loading, tabRoutes };
};

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { defaultTabRoutes, tabRoutes } = useTabRoutes(true);
  const { orientation } = useContext(OrientationContext);
  const isPortrait = orientation === 'portrait';

  const tabConfigs = tabRoutes?.tabConfigs;

  if (!tabConfigs) return <LoadingSpinner loading />;

  const { inactiveBackgroundColor: backgroundColor } = tabRoutes || defaultTabRoutes;

  return (
    <Tab.Navigator
      tabBar={renderThemeAwareBottomTabBar}
      screenOptions={{
        headerShown: false,
        tabBarAllowFontScaling: false,
        tabBarStyle: { backgroundColor },
        tabBarActiveBackgroundColor:
          tabRoutes?.activeBackgroundColor || defaultTabRoutes.activeBackgroundColor,
        tabBarActiveTintColor: tabRoutes?.activeTintColor || defaultTabRoutes.activeTintColor,
        tabBarHideOnKeyboard: true,
        tabBarInactiveBackgroundColor: backgroundColor,
        tabBarInactiveTintColor: tabRoutes?.inactiveTintColor || defaultTabRoutes.inactiveTintColor,
        tabBarLabelPosition: isPortrait ? 'below-icon' : 'beside-icon'
      }}
    >
      {tabConfigs?.map((tabConfig, index) => {
        const stackName = `Stack${index}`;

        return (
          <Tab.Screen key={stackName} name={stackName} options={tabConfig.tabOptions}>
            {() => <AppStackNavigator stackConfig={tabConfig.stackConfig} />}
          </Tab.Screen>
        );
      })}
    </Tab.Navigator>
  );
};
