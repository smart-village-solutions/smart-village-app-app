import { createStackNavigator } from 'react-navigation';

import { StaticScreen } from '../screens';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

export const StaticStackNavigator = createStackNavigator(
  {
    Static: {
      screen: StaticScreen
    }
  },
  defaultStackNavigatorConfig('Static')
);
