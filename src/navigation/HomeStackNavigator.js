import { createStackNavigator } from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

import { texts } from '../config';

export const HomeStackNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: ({ navigation }) => ({
        title: texts.screenTitles.home
      })
    }
  },
  defaultStackNavigatorConfig('Home')
);
