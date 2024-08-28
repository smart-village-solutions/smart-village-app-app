/* eslint-disable react-native/no-inline-styles */
import React from 'react';

import { OrientationAwareIcon } from '../../components';
import { ScreenName, TabConfig, TabNavigatorConfig } from '../../types';
import { colors } from '../colors';
import { Icon } from '../icons';
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
