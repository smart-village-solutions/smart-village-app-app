import { createStackNavigator } from 'react-navigation';

import StaticScreen from '../screens/StaticScreen';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

export const StaticStackNavigator = createStackNavigator(
  {
    Static: {
      screen: StaticScreen
    }
  },
  defaultStackNavigatorConfig('Static')
);
