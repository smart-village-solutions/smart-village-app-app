import { createStackNavigator } from 'react-navigation';

import { HomeScreen, HtmlScreen } from '../screens';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

import { texts } from '../config';

export const HomeStackNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: () => ({
        title: texts.screenTitles.home
      })
    },
    Html: {
      screen: HtmlScreen
    }
  },
  defaultStackNavigatorConfig('Home')
);
