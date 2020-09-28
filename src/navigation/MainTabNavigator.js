import React from 'react';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import { home, service } from '../icons';
import { Icon } from '../components';
import {
  AboutScreen,
  CompanyScreen,
  FormScreen,
  HtmlScreen,
  ServiceScreen,
  WebScreen
} from '../screens';

import AppStackNavigator from './AppStackNavigator';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';
import { colors, device, normalize, texts } from '../config';

const HomeStack = AppStackNavigator(false);

HomeStack.navigationOptions = {
  tabBarLabel: texts.tabBarLabel.home,
  tabBarIcon: ({ focused }) => <Icon icon={home(focused ? colors.accent : colors.primary)} />
};

const ServiceStack = createStackNavigator(
  {
    Service: {
      screen: ServiceScreen,
      navigationOptions: (props) => ({
        title: props.navigation.getParam('title', texts.screenTitles.service)
      })
    },
    Html: {
      screen: HtmlScreen,
      navigationOptions: (props) => ({
        title: props.navigation.getParam('title', '')
      })
    },
    Web: {
      screen: WebScreen,
      navigationOptions: (props) => ({
        title: props.navigation.getParam('title', '')
      })
    }
  },
  defaultStackNavigatorConfig('Service', false)
);

ServiceStack.navigationOptions = {
  tabBarLabel: texts.tabBarLabel.service,
  tabBarIcon: ({ focused }) => <Icon icon={service(focused ? colors.accent : colors.primary)} />
};

const CompanyStack = createStackNavigator(
  {
    Company: {
      screen: CompanyScreen,
      navigationOptions: (props) => ({
        title: props.navigation.getParam('title', texts.screenTitles.company)
      })
    },
    Html: {
      screen: HtmlScreen,
      navigationOptions: (props) => ({
        title: props.navigation.getParam('title', '')
      })
    },
    Web: {
      screen: WebScreen,
      navigationOptions: (props) => ({
        title: props.navigation.getParam('title', '')
      })
    }
  },
  defaultStackNavigatorConfig('', false)
);

CompanyStack.navigationOptions = {
  tabBarLabel: texts.tabBarLabel.company,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={device.patform === 'ios' ? 'ios-briefcase' : 'md-briefcase'}
    />
  )
};

const AboutStack = createStackNavigator(
  {
    About: {
      screen: AboutScreen,
      navigationOptions: (props) => ({
        title: props.navigation.getParam('title', texts.screenTitles.about)
      })
    },
    Html: {
      screen: HtmlScreen,
      navigationOptions: (props) => ({
        title: props.navigation.getParam('title', '')
      })
    },
    Web: {
      screen: WebScreen,
      navigationOptions: (props) => ({
        title: props.navigation.getParam('title', '')
      })
    },
    Form: {
      screen: FormScreen,
      navigationOptions: (props) => ({
        title: props.navigation.getParam('title', '')
      })
    }
  },
  defaultStackNavigatorConfig('About', false)
);

AboutStack.navigationOptions = {
  tabBarLabel: texts.tabBarLabel.about,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={device.patform === 'ios' ? 'ios-menu' : 'md-menu'} />
  )
};

const MainTabNavigator = createBottomTabNavigator(
  {
    HomeStack,
    ServiceStack,
    CompanyStack,
    AboutStack
  },
  {
    tabBarOptions: {
      activeTintColor: colors.accent,
      inactiveTintColor: colors.primary,
      tabStyle: { marginTop: normalize(5) },
      labelStyle: { margin: normalize(3) }
    }
  }
);

export default MainTabNavigator;
