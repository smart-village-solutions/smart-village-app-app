import { createDrawerNavigator } from 'react-navigation';

import { HomeStackNavigator } from './HomeStackNavigator';
import { IndexStackNavigator } from './IndexStackNavigator';
import { StaticStackNavigator } from './StaticStackNavigator';

import { texts } from '../config';

// data coming later from API
const drawerRoutes = {
  News: {
    screen: IndexStackNavigator,
    navigationOptions: ({ navigation }) => ({
      title: texts.screenTitles.news
    })
  },
  Events: {
    screen: IndexStackNavigator,
    navigationOptions: ({ navigation }) => ({
      title: texts.screenTitles.events
    })
  },
  Policy: {
    screen: StaticStackNavigator,
    navigationOptions: ({ navigation }) => ({
      title: texts.screenTitles.policy
    })
  },
  Impress: {
    screen: StaticStackNavigator,
    navigationOptions: ({ navigation }) => ({
      title: texts.screenTitles.impress
    })
  }
};

export const AppDrawerNavigator = createDrawerNavigator(
  {
    HomeStack: {
      screen: HomeStackNavigator,
      navigationOptions: ({ navigation }) => ({
        title: texts.screenTitles.home
      })
    },
    ...drawerRoutes
  },
  {
    initialRouteName: 'HomeStack',
    drawerPosition: 'right'
  }
);
