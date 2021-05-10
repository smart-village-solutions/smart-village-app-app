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
import { defaultStackNavigatorScreenOptions } from './defaultStackNavigatorConfig';
import { colors, device, normalize, texts } from '../config';
import { createStackNavigator } from '@react-navigation/stack';

const HomeStack = () => AppStackNavigator(false);

const Service = createStackNavigator();

const ServiceStack = () => (
  <Service.Navigator
    initialRouteName="Service"
    screenOptions={defaultStackNavigatorScreenOptions(false)}
  >
    <Service.Screen
      name="Service"
      component={ServiceScreen}
      options={({ route }) => ({
        title: route.params?.title?.length ?? texts.screenTitles.service
      })}
    />
    <Service.Screen name="Html" component={HtmlScreen} />
    <Service.Screen name="Web" component={WebScreen} />
  </Service.Navigator>
);

const Company = createStackNavigator();

const CompanyStack = () => (
  <Company.Navigator
    initialRouteName="Service"
    screenOptions={defaultStackNavigatorScreenOptions(false)}
  >
    <Company.Screen
      name="Company"
      component={CompanyScreen}
      options={({ route }) => ({
        title: route.params?.title?.length ?? texts.screenTitles.company
      })}
    />
    <Company.Screen name="Html" component={HtmlScreen} />
    <Company.Screen name="Web" component={WebScreen} />
  </Company.Navigator>
);

const About = createStackNavigator();

const AboutStack = () => (
  <About.Navigator
    initialRouteName="About"
    screenOptions={defaultStackNavigatorScreenOptions(false)}
  >
    <About.Screen
      name="About"
      component={AboutScreen}
      options={({ route }) => ({
        title: route.params?.title?.length ?? texts.screenTitles.about
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
        tabBarIcon: ({ focused }) => (
          <TabBarIcon xml={home(focused ? colors.accent : colors.primary)} />
        )
      }}
    />
    <Tab.Screen
      name="ServiceStack"
      component={ServiceStack}
      options={{
        tabBarLabel: texts.tabBarLabel.service,
        tabBarIcon: ({ focused }) => (
          <TabBarIcon xml={service(focused ? colors.accent : colors.primary)} />
        )
      }}
    />
    <Tab.Screen
      name="CompanyStack"
      component={CompanyStack}
      options={{
        tabBarLabel: texts.tabBarLabel.company,
        tabBarIcon: ({ focused }) => (
          <TabBarIcon
            name={device.patform === 'ios' ? 'ios-briefcase' : 'md-briefcase'}
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
        tabBarIcon: ({ focused }) => (
          <TabBarIcon
            name={device.patform === 'ios' ? 'ios-menu' : 'md-menu'}
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
