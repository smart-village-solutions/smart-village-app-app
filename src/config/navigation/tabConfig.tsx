import React from 'react';
import { View } from 'react-native';

import { Badge, OrientationAwareIcon } from '../../components';
import { ScreenName, TabConfig, TabNavigatorConfig } from '../../types';
import { Icon } from '../Icon';
import { colors } from '../colors';
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
    tabBarIcon: ({ color, focused }: TabBarIconProps) => (
      <OrientationAwareIcon
        color={color}
        Icon={focused ? Icon.HomeFilled : Icon.Home}
        stroke={focused ? 2 : 1}
        landscapeStyle={{ marginRight: -normalize(6), marginTop: -normalize(5) }}
        size={normalize(24)}
        style={{ marginTop: normalize(10) }}
      />
    )
  }
};

const serviceTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Profile,
    isDrawer: false
  }),
  tabOptions: {
    tabBarLabel: texts.tabBarLabel.profile,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => (
      <View>
        <OrientationAwareIcon
          color={color}
          Icon={focused ? Icon.ProfileFilled : Icon.Profile}
          landscapeStyle={
            focused
              ? { marginRight: -normalize(16), marginTop: -normalize(4) }
              : { marginRight: -normalize(6), marginTop: -normalize(4) }
          }
          size={normalize(24)}
          style={{ marginTop: normalize(10) }}
        />
        <Badge containerStyle={{ right: normalize(-10), top: normalize(5) }} />
      </View>
    )
  }
};

const bookmarksTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Bookmarks,
    isDrawer: false
  }),
  tabOptions: {
    tabBarLabel: texts.tabBarLabel.favorites,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => (
      <OrientationAwareIcon
        color={color}
        Icon={focused ? Icon.HeartFilled : Icon.HeartEmpty}
        landscapeStyle={{ marginRight: -normalize(6), marginTop: -normalize(4) }}
        size={normalize(24)}
        style={{ marginTop: normalize(10) }}
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
    tabBarAccessibilityLabel: `${texts.tabBarLabel.about} (Tab 5 von 5)`,
    tabBarLabel: texts.tabBarLabel.about,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => (
      <OrientationAwareIcon
        color={color}
        Icon={Icon.About}
        stroke={focused ? 2 : 1}
        landscapeStyle={{ marginRight: -normalize(6), marginTop: -normalize(4) }}
        size={normalize(24)}
        style={{ marginTop: normalize(10) }}
      />
    )
  }
};

export const tabNavigatorConfig: TabNavigatorConfig = {
  activeTintColor: colors.darkText,
  inactiveTintColor: colors.gray120,
  activeBackgroundColor: colors.surface,
  inactiveBackgroundColor: colors.surface,
  tabConfigs: [homeTabConfig, serviceTabConfig, bookmarksTabConfig, aboutTabConfig]
};
