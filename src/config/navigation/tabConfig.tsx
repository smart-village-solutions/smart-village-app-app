/* eslint-disable react-native/no-inline-styles */
import React from 'react';

import { OrientationAwareIcon } from '../../components';
import { ScreenName, TabConfig, TabNavigatorConfig } from '../../types';
import { colors } from '../colors';
import { Icon } from '../Icon';
import { normalize } from '../normalize';
import { texts } from '../texts';

import { defaultStackConfig } from './defaultStackConfig';
import { testIDs } from '../maestro';

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
    tabBarLabel: texts.tabBarLabel.home,
    tabBarTestID: testIDs.tabBar.home,
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
    tabBarTestID: testIDs.tabBar.service,
    tabBarIcon: ({ color }: TabBarIconProps) => (
      <OrientationAwareIcon color={color} Icon={Icon.Service} />
    )
  }
};

const companyTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Company,
    isDrawer: false
  }),
  tabOptions: {
    tabBarLabel: texts.tabBarLabel.company,
    tabBarTestID: testIDs.tabBar.company,
    tabBarIcon: ({ color }: TabBarIconProps) => (
      <OrientationAwareIcon
        color={color}
        Icon={Icon.Company}
        landscapeStyle={{ marginRight: -normalize(4), marginTop: 0 }}
        size={normalize(26)}
        style={{ marginTop: normalize(3) }}
      />
    )
  }
};

const aboutTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.About,
    isDrawer: false
  }),
  tabOptions: {
    tabBarLabel: texts.tabBarLabel.about,
    tabBarTestID: testIDs.tabBar.about,
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
  tabConfigs: [homeTabConfig, serviceTabConfig, companyTabConfig, aboutTabConfig]
};
