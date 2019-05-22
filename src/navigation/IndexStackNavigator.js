import { createStackNavigator } from 'react-navigation';

import { DetailScreen, HtmlScreen, IndexScreen } from '../screens';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

export const IndexStackNavigator = createStackNavigator(
  {
    Index: {
      screen: IndexScreen
    },
    Detail: {
      screen: DetailScreen
    },
    Html: {
      screen: HtmlScreen
    }
  },
  defaultStackNavigatorConfig('Index')
);
