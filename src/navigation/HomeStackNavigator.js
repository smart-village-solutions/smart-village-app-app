import { createStackNavigator } from 'react-navigation';

import { HomeScreen } from '../screens';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

import { texts } from '../config';

export const HomeStackNavigator = createStackNavigator(
  {
    Index: {
      screen: HomeScreen,
      navigationOptions: () => ({
        title: texts.screenTitles.home
      })
    }
  },
  defaultStackNavigatorConfig('Index')
);
