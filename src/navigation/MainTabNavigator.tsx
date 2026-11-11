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
import type { getScreenOptions } from './screenOptions';
import { renderThemeAwareBottomTabBar } from './ThemeAwareBottomTabBar';

const { REFRESH_INTERVALS } = consts;
type ResolvedTabRoutes = Omit<TabNavigatorConfig, 'tabConfigs'> & { tabConfigs: TabConfig[] };
type ScreenOptionsProps = Parameters<ReturnType<typeof getScreenOptions>>[0];
type ConfiguredTitleParams = { title?: unknown; __svaConfiguredTitle?: string };

const isTabConfig = (
  tabConfig: CustomTab | TabConfig | string | undefined
): tabConfig is TabConfig =>
  !!tabConfig && typeof tabConfig !== 'string' && 'stackConfig' in tabConfig;

const initialTitle = (screen?: ScreenConfig) =>
  (screen?.initialParams as ConfiguredTitleParams | undefined)?.title;

const withTranslatedTitle = (
  screen: ScreenConfig,
  original: unknown,
  translated: unknown
): ScreenConfig => {
  if (typeof original !== 'string') return screen;

  const { screenOptions } = screen;
  const title = typeof translated === 'string' ? translated : original;
  return {
    ...screen,
    initialParams: { ...screen.initialParams, __svaConfiguredTitle: original },
    screenOptions: (props: ScreenOptionsProps) => {
      const options =
        (typeof screenOptions === 'function' ? screenOptions(props) : screenOptions) || {};
      const params = props.route.params as ConfiguredTitleParams | undefined;
      // Keep identifying the original title after a static-content refresh has changed it.
      const initial = params?.__svaConfiguredTitle ?? original;
      return params?.title === initial && title !== initial ? { ...options, title } : options;
    }
  };
};

export const useTabRoutes = (translate = false) => {
  const { colors, mode } = useTheme();
  const { isMainserverUp } = useContext(NetworkContext);
  const defaultTabRoutes = useMemo(() => createDefaultTabNavigatorConfig(colors), [colors]);
  const [lastTabRoutes, setLastTabRoutes] = useState<ResolvedTabRoutes>();
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
          if (!translate || !tabRoutesData) return tabConfig;
          const translated = translatedRoutes?.tabConfigs[index];
          const localized = isTabConfig(translated) ? translated : tabConfig;

          return {
            tabOptions: localized.tabOptions,
            stackConfig: {
              ...tabConfig.stackConfig,
              screenConfigs: tabConfig.stackConfig.screenConfigs.map((screen, screenIndex) =>
                withTranslatedTitle(
                  screen,
                  initialTitle(screen),
                  initialTitle(localized.stackConfig.screenConfigs[screenIndex])
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
          const originalTitle = tabConfig.params?.title;
          if (!translate || typeof originalTitle !== 'string') return config;

          return {
            ...config,
            stackConfig: {
              ...config.stackConfig,
              screenConfigs: config.stackConfig.screenConfigs.map((screen) =>
                screen.routeName === config.stackConfig.initialRouteName
                  ? withTranslatedTitle(screen, originalTitle, translated?.params?.title)
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
  }, [colors, defaultTabRoutes, mode, tabRoutesData, translate, translatedRoutes]);

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
