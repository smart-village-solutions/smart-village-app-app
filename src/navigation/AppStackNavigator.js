import { createStackNavigator } from 'react-navigation';

import {
  BookmarkScreen,
  DetailScreen,
  HomeScreen,
  HtmlScreen,
  IndexScreen,
  SettingsScreen,
  WebScreen
} from '../screens';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

import { texts } from '../config';
import { BookmarkCategoryScreen } from '../screens/BookmarkCategoryScreen';

const AppStackNavigator = (headerRight = true) =>
  createStackNavigator(
    {
      Home: {
        screen: HomeScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', texts.screenTitles.home)
        })
      },
      Bookmarks: {
        screen: BookmarkScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', '')
        })
      },
      BookmarkCategory: {
        screen: BookmarkCategoryScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', '')
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
      },
      Settings: {
        screen: SettingsScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', texts.screenTitles.settings)
        })
      }
    },
    defaultStackNavigatorConfig('Home', headerRight)
  );

export default AppStackNavigator;
