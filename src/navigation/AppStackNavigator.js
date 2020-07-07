import { createStackNavigator } from 'react-navigation';

import { DetailScreen, HomeScreen, HtmlScreen, IndexScreen, WebScreen } from '../screens';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

import { texts } from '../config';

const AppStackNavigator = (headerRight = true) =>
  createStackNavigator(
    {
      Home: {
        screen: HomeScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', texts.screenTitles.home)
        })
      },
      Index: {
        screen: IndexScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', '')
        })
      },
      Detail: {
        screen: DetailScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', '')
        })
      },
      Html: {
        screen: HtmlScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', '')
        })
      },
      Web: {
        screen: WebScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', '')
        })
      }
    },
    defaultStackNavigatorConfig('Home', headerRight)
  );

export default AppStackNavigator;
