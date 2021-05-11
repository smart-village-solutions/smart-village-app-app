import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { home, service } from '../icons';
import { TabBarIcon } from '../components';
import {
  AboutScreen,
  CompanyScreen,
  FormScreen,
  HtmlScreen,
  ServiceScreen,
  WebScreen
} from '../screens';

import { AppStackNavigator } from './AppStackNavigator';
import { defaultStackNavigatorScreenOptions } from './screenOptions';
import { colors, device, normalize, texts } from '../config';
import { createStackNavigator } from '@react-navigation/stack';

const HomeStack = () => AppStackNavigator(false);

const Service = createStackNavigator<Record<string, { title: string } | undefined>>();

const ServiceStack = () => (
  <Service.Navigator
    initialRouteName="Service"
    screenOptions={defaultStackNavigatorScreenOptions(false)}
  >
    <Service.Screen
      name="Service"
      component={ServiceScreen}
      options={({ route }) => ({
        title: route.params?.title?.length ? route.params?.title : texts.screenTitles.service
      })}
    />
    <Service.Screen name="Html" component={HtmlScreen} />
    <Service.Screen name="Web" component={WebScreen} />
  </Service.Navigator>
);

const Company = createStackNavigator<Record<string, { title: string } | undefined>>();

const CompanyStack = () => (
  <Company.Navigator
    initialRouteName="Service"
    screenOptions={defaultStackNavigatorScreenOptions(false)}
  >
    <Company.Screen
      name="Company"
      component={CompanyScreen}
      options={({ route }) => ({
        title: route.params?.title?.length ? route.params?.title : texts.screenTitles.company
      })}
    />
    <Company.Screen name="Html" component={HtmlScreen} />
    <Company.Screen name="Web" component={WebScreen} />
  </Company.Navigator>
);

const About = createStackNavigator<Record<string, { title: string } | undefined>>();

const AboutStack = () => (
  <About.Navigator
    initialRouteName="About"
    screenOptions={defaultStackNavigatorScreenOptions(false)}
  >
    <About.Screen
      name="About"
      component={AboutScreen}
      options={({ route }) => ({
        title: route.params?.title?.length ? route.params?.title : texts.screenTitles.about
      })}
    />
    <About.Screen name="Html" component={HtmlScreen} />
    <About.Screen name="Web" component={WebScreen} />
    <About.Screen name="Form" component={FormScreen} />
  </About.Navigator>
);

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => (
  <Tab.Navigator
    tabBarOptions={{
      activeTintColor: colors.accent,
      inactiveTintColor: colors.primary,
      tabStyle: { marginTop: normalize(0) },
      keyboardHidesTabBar: device.platform === 'android'
    }}
  >
    <Tab.Screen
      name="HomeStack"
      component={HomeStack}
      options={{
        tabBarLabel: texts.tabBarLabel.home,
        tabBarIcon: ({ focused }: { focused: boolean }) => (
          <TabBarIcon xml={home(focused ? colors.accent : colors.primary)} />
        )
      }}
    />
    <Tab.Screen
      name="ServiceStack"
      component={ServiceStack}
      options={{
        tabBarLabel: texts.tabBarLabel.service,
        tabBarIcon: ({ focused }: { focused: boolean }) => (
          <TabBarIcon xml={service(focused ? colors.accent : colors.primary)} />
        )
      }}
    />
    <Tab.Screen
      name="CompanyStack"
      component={CompanyStack}
      options={{
        tabBarLabel: texts.tabBarLabel.company,
        tabBarIcon: ({ focused }: { focused: boolean }) => (
          <TabBarIcon
            name={device.platform === 'ios' ? 'ios-briefcase' : 'md-briefcase'}
            style={{ marginTop: normalize(3) }}
            landscapeStyle={{ marginRight: -normalize(4), marginTop: 0 }}
            focused={focused}
          />
        )
      }}
    />
    <Tab.Screen
      name="AboutStack"
      component={AboutStack}
      options={{
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
      }}
    />
  </Tab.Navigator>
);
