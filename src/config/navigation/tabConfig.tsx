/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import type { ColorValue } from 'react-native';

import { OrientationAwareIcon, TabBarIcon } from '../../components';
import { resolveTabIconColors } from '../../helpers/tabNavigationHelper';
import {
  CustomTab,
  ScreenName,
  ResolvedThemeMode,
  TabConfig,
  TabNavigatorConfig,
  ThemeColorPalette
} from '../../types';
import { lightColors } from '../colors';
import { Icon } from '../icons';
import { normalize } from '../normalize';
import { texts } from '../texts';

import { defaultStackConfig } from './defaultStackConfig';

type TabBarIconProps = {
  focused: boolean;
  color: ColorValue;
  size: number;
};

const getDefaultTabIconProps = (color: ColorValue, focused: boolean, fillOnFocus: boolean) =>
  resolveTabIconColors(focused, color as string, fillOnFocus);

const homeTabConfig = (fillOnFocus: boolean): TabConfig => ({
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Home,
    isDrawer: false
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${texts.tabBarLabel.home} (Tab 1 von 5)`,
    tabBarLabel: texts.tabBarLabel.home,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => {
      const iconColors = getDefaultTabIconProps(color, focused, fillOnFocus);

      return (
        <OrientationAwareIcon
          {...iconColors}
          Icon={Icon.Home}
          iconName="Home"
          size={normalize(30)}
        />
      );
    }
  }
});

const serviceTabConfig = (fillOnFocus: boolean): TabConfig => ({
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Service,
    isDrawer: false
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${texts.tabBarLabel.service} (Tab 2 von 5)`,
    tabBarLabel: texts.tabBarLabel.service,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => {
      const iconColors = getDefaultTabIconProps(color, focused, fillOnFocus);

      return (
        <OrientationAwareIcon
          {...iconColors}
          Icon={Icon.Service}
          iconName="Service"
          size={normalize(30)}
        />
      );
    }
  }
});

const pointOfInterestTabConfig = (colors: ThemeColorPalette, fillOnFocus: boolean): TabConfig => ({
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Index,
    isDrawer: false
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${texts.tabBarLabel.pointsOfInterest} (Tab 3 von 5)`,
    tabBarLabel: texts.tabBarLabel.pointsOfInterest,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => {
      const iconColors = getDefaultTabIconProps(color, focused, fillOnFocus);

      return (
        <OrientationAwareIcon
          {...iconColors}
          Icon={Icon.Location}
          iconName="Location"
          size={normalize(30)}
        />
      );
    }
  }
});

const eventsTabConfig = (fillOnFocus: boolean): TabConfig => ({
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Events,
    isDrawer: false
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${texts.tabBarLabel.events} (Tab 4 von 5)`,
    tabBarLabel: texts.tabBarLabel.events,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => {
      const iconColors = getDefaultTabIconProps(color, focused, fillOnFocus);

      return (
        <OrientationAwareIcon
          {...iconColors}
          Icon={Icon.Calendar}
          iconName="Calendar"
          size={normalize(30)}
        />
      );
    }
  }
});

const aboutTabConfig = (fillOnFocus: boolean): TabConfig => ({
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.About,
    isDrawer: false
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${texts.tabBarLabel.about} (Tab 5 von 5)`,
    tabBarLabel: texts.tabBarLabel.about,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => {
      const iconColors = getDefaultTabIconProps(color, focused, fillOnFocus);

      return (
        <OrientationAwareIcon
          {...iconColors}
          Icon={Icon.About}
          iconName="About"
          landscapeStyle={{ marginRight: -normalize(6) }}
          style={{ marginTop: normalize(3) }}
        />
      );
    }
  }
});

export const createDefaultTabNavigatorConfig = (
  colors: ThemeColorPalette = lightColors,
  tabBarIconFillOnFocus: boolean = false
): TabNavigatorConfig => ({
  activeTintColor: colors.accent,
  inactiveTintColor: colors.primary,
  activeBackgroundColor: colors.surface,
  inactiveBackgroundColor: colors.surface,
  tabConfigs: [
    homeTabConfig(tabBarIconFillOnFocus),
    serviceTabConfig(tabBarIconFillOnFocus),
    pointOfInterestTabConfig(colors, tabBarIconFillOnFocus),
    eventsTabConfig(tabBarIconFillOnFocus),
    aboutTabConfig(tabBarIconFillOnFocus)
  ]
});

export const createDynamicTabConfig = ({
  accessibilityLabel,
  activeIcon,
  activeIconName,
  activeSvg,
  colors = lightColors,
  icon,
  iconLandscapeStyle,
  iconName,
  iconSet,
  iconSize = 24,
  iconStyle,
  index,
  isHighlightedTab,
  label,
  params,
  screen,
  strokeColor,
  strokeWidth,
  svg,
  tabBarIconFillOnFocus = false,
  tabBarLabelStyle,
  themeImages,
  themeMode = 'light',
  tilesScreenParams,
  totalCount
}: CustomTab & {
  colors?: ThemeColorPalette;
  index: number;
  themeMode?: ResolvedThemeMode;
  totalCount: number;
}): TabConfig => ({
  stackConfig: defaultStackConfig({
    initialParams: params,
    initialRouteName: screen,
    isDrawer: false,
    tilesScreenParams
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${accessibilityLabel || label} (Tab ${index + 1} von ${totalCount})`,
    tabBarLabel: label,
    tabBarLabelStyle,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => (
      <TabBarIcon
        activeIcon={activeIcon}
        activeIconName={activeIconName}
        activeSvg={activeSvg}
        color={color}
        focused={focused}
        icon={icon}
        iconLandscapeStyle={iconLandscapeStyle}
        iconName={iconName}
        iconSet={iconSet}
        iconSize={iconSize}
        iconStyle={iconStyle}
        isHighlightedTab={isHighlightedTab}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        svg={svg}
        tabBarIconFillOnFocus={tabBarIconFillOnFocus}
        themeColors={colors}
        themeImages={themeImages}
        themeMode={themeMode}
      />
    )
  }
});
