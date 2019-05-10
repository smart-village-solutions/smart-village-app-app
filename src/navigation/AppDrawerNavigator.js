import { createDrawerNavigator } from 'react-navigation';

import { HomeStackNavigator } from './HomeStackNavigator';
import { IndexStackNavigator } from './IndexStackNavigator';
import { StaticStackNavigator } from './StaticStackNavigator';

import { texts } from '../config';

// data coming later from API
const drawerRoutes = {
  News: {
    screen: IndexStackNavigator,
    navigationOptions: () => ({
      title: texts.screenTitles.news
    })
  },
  Events: {
    screen: IndexStackNavigator,
    navigationOptions: () => ({
      title: texts.screenTitles.events
    })
  },
  Policy: {
    screen: StaticStackNavigator,
    navigationOptions: () => ({
      title: texts.screenTitles.policy
    })
  },
  Impress: {
    screen: StaticStackNavigator,
    navigationOptions: () => ({
      title: texts.screenTitles.impress
    })
  }
};

export const AppDrawerNavigator = createDrawerNavigator(
  {
    HomeStack: {
      screen: HomeStackNavigator,
      navigationOptions: () => ({
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
