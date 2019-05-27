import { createStackNavigator } from 'react-navigation';

import { HtmlScreen } from '../screens';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

export const HtmlStackNavigator = createStackNavigator(
  {
    Index: {
      screen: HtmlScreen,
      navigationOptions: (props) => ({
        title: props.navigation.getParam('title', '') // dynamic title depending on the route params
      })
    }
  },
  defaultStackNavigatorConfig('Index')
);
