import { createDrawerNavigator } from 'react-navigation';

import { HomeStackNavigator } from './HomeStackNavigator';
import { IndexStackNavigator } from './IndexStackNavigator';
import { StaticStackNavigator } from './StaticStackNavigator';

// data coming later from API
const drawerRoutes = {
  News: {
    screen: IndexStackNavigator,
    navigationOptions: ({ navigation }) => ({
      title: 'Nachrichten'
    })
  },
  Events: {
    screen: IndexStackNavigator,
    navigationOptions: ({ navigation }) => ({
      title: 'Veranstaltungen'
    })
  },
  Policy: {
    screen: StaticStackNavigator,
    navigationOptions: ({ navigation }) => ({
      title: 'Datenschutz'
    })
  },
  Impress: {
    screen: StaticStackNavigator,
    navigationOptions: ({ navigation }) => ({
      title: 'Impressum'
    })
  }
};

export const AppDrawerNavigator = createDrawerNavigator(
  {
    HomeStack: {
      screen: HomeStackNavigator,
      navigationOptions: ({ navigation }) => ({
        title: 'Name of the village'
      })
    },
    ...drawerRoutes
  },
  {
    initialRouteName: 'HomeStack',
    drawerPosition: 'right'
  }
);
