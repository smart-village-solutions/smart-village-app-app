import { createStackNavigator } from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

export const HomeStackNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: ({ navigation }) => ({
        title: 'Name of the village'
      })
    }
  },
  defaultStackNavigatorConfig('Home')
);
