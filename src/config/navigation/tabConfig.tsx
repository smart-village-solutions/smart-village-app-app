/* eslint-disable react-native/no-inline-styles */
import { upperFirst } from 'lodash';
import React from 'react';

import { OrientationAwareIcon } from '../../components';
import { ScreenName, TabConfig, TabNavigatorConfig } from '../../types';
import { colors } from '../colors';
import { Icon } from '../Icon';
import { normalize } from '../normalize';
import { texts } from '../texts';

import { defaultStackConfig } from './defaultStackConfig';

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const homeTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Home,
    isDrawer: false
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${texts.tabBarLabel.home} (Tab 1 von 5)`,
    tabBarLabel: texts.tabBarLabel.home,
    tabBarIcon: ({ color }: TabBarIconProps) => (
      <OrientationAwareIcon color={color} Icon={Icon.Home} />
    )
  }
};

const serviceTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Service,
    isDrawer: false
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${texts.tabBarLabel.service} (Tab 2 von 5)`,
    tabBarLabel: texts.tabBarLabel.service,
    tabBarIcon: ({ color }: TabBarIconProps) => (
      <OrientationAwareIcon color={color} Icon={Icon.Service} />
    )
  }
};

const pointOfInterestTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Index,
    isDrawer: false
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${texts.tabBarLabel.pointsOfInterest} (Tab 3 von 5)`,
    tabBarLabel: texts.tabBarLabel.pointsOfInterest,
    tabBarIcon: ({ color }: TabBarIconProps) => (
      <OrientationAwareIcon color={color} Icon={Icon.Location} size={normalize(30)} />
    )
  }
};

const eventsTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Events,
    isDrawer: false
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${texts.tabBarLabel.events} (Tab 4 von 5)`,
    tabBarLabel: texts.tabBarLabel.events,
    tabBarIcon: ({ color }: TabBarIconProps) => (
      <OrientationAwareIcon color={color} Icon={Icon.Calendar} size={normalize(24)} />
    )
  }
};

const aboutTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.About,
    isDrawer: false
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${texts.tabBarLabel.about} (Tab 5 von 5)`,
    tabBarLabel: texts.tabBarLabel.about,
    tabBarIcon: ({ color }: TabBarIconProps) => (
      <OrientationAwareIcon
        color={color}
        Icon={Icon.About}
        landscapeStyle={{ marginRight: -normalize(6) }}
        size={normalize(28)}
        style={{ marginTop: normalize(3) }}
      />
    )
  }
};

export const tabNavigatorConfig: TabNavigatorConfig = {
  activeTintColor: colors.accent,
  inactiveTintColor: colors.primary,
  activeBackgroundColor: colors.surface,
  inactiveBackgroundColor: colors.surface,
  tabConfigs: [
    homeTabConfig,
    serviceTabConfig,
    pointOfInterestTabConfig,
    eventsTabConfig,
    aboutTabConfig
  ]
};

export const createDynamicTabConfig = (
  accessibilityLabel: string,
  iconName: string,
  iconSize: number,
  index: number,
  label: string,
  length: number,
  screen: ScreenName,
  initialParams?: Record<string, any>
): TabConfig => ({
  stackConfig: defaultStackConfig({
    initialParams,
    initialRouteName: screen,
    isDrawer: false
  }),
  tabOptions: {
    tabBarAccessibilityLabel: `${accessibilityLabel || label} (Tab ${index + 1} von ${length})`,
    tabBarLabel: label,
    tabBarIcon: ({ color }: TabBarIconProps) => (
      <OrientationAwareIcon
        color={color}
        Icon={Icon[upperFirst(iconName)]}
        size={normalize(iconSize)}
      />
    )
  }
});
