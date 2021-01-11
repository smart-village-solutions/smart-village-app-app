import { createStackNavigator } from 'react-navigation';

import {
  ConstructionSiteDetailScreen,
  ConstructionSiteOverviewScreen,
  DetailScreen,
  HomeScreen,
  HtmlScreen,
  IndexScreen,
  SettingsScreen,
  WebScreen
} from '../screens';
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
      ConstructionSiteDetail: {
        screen: ConstructionSiteDetailScreen,
        navigationOptions: () => ({
          title: texts.screenTitles.constructionSite
        })
      },
      ConstructionSiteOverview: {
        screen: ConstructionSiteOverviewScreen,
        navigationOptions: () => ({
          title: texts.screenTitles.constructionSites
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
