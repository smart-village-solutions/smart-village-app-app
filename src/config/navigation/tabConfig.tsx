import React from 'react';

import { TabBarIcon } from '../../components';
import { home, service } from '../../icons';
import { ScreenName, TabConfig, TabNavigatorConfig } from '../../types';
import { colors } from '../colors';
import { device } from '../device';
import { normalize } from '../normalize';
import { texts } from '../texts';

import { defaultStackConfig } from './defaultStackConfig';

const homeTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Home,
    isDrawer: false
  }),
  tabOptions: {
    tabBarLabel: texts.tabBarLabel.home,
    tabBarIcon: ({ focused }: { focused: boolean }) => (
      <TabBarIcon xml={home(focused ? colors.accent : colors.primary)} />
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
    tabBarIcon: ({ focused }: { focused: boolean }) => (
      <TabBarIcon xml={service(focused ? colors.accent : colors.primary)} />
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
    tabBarIcon: ({ focused }: { focused: boolean }) => (
      <TabBarIcon
        name={device.platform === 'ios' ? 'ios-briefcase' : 'md-briefcase'}
        style={{ marginTop: normalize(3) }}
        landscapeStyle={{ marginRight: -normalize(4), marginTop: 0 }}
        focused={focused}
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
    tabBarIcon: ({ focused }: { focused: boolean }) => (
      <TabBarIcon
        name={device.platform === 'ios' ? 'ios-menu' : 'md-menu'}
        size={normalize(28)}
        style={{ marginTop: normalize(3) }}
        landscapeStyle={{ marginRight: -normalize(6) }}
        focused={focused}
      />
    )
  }
};

export const tabNavigatorConfig: TabNavigatorConfig = {
  activeTintColor: colors.accent,
  inactiveTintColor: colors.primary,
  tabConfigs: [homeTabConfig, serviceTabConfig, companyTabConfig, aboutTabConfig]
};
