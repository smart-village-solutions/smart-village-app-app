import { createStackNavigator } from 'react-navigation';

import {
  BookmarkCategoryScreen,
  BookmarkScreen,
  ConstructionSiteDetailScreen,
  ConstructionSiteOverviewScreen,
  DataProviderScreen,
  DetailScreen,
  FormScreen,
  HomeScreen,
  HtmlScreen,
  IndexScreen,
  LunchScreen,
  SettingsScreen,
  WasteCollectionScreen,
  WeatherScreen,
  WebScreen,
  WasteReminderScreen
} from '../screens';
import {
  DetailScreen as BBBUSDetailScreen,
  IndexScreen as BBBUSIndexScreen
} from '../screens/BB-BUS';

import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

import { texts } from '../config';

const AppStackNavigator = (headerRight = true) =>
  createStackNavigator(
    {
      BBBUSIndex: {
        screen: BBBUSIndexScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', '')
        })
      },
      BBBUSDetail: {
        screen: BBBUSDetailScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', '')
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
      ConstructionSiteDetail: {
        screen: ConstructionSiteDetailScreen,
        navigationOptions: () => ({
          title: texts.screenTitles.constructionSite
        })
      },
      ConstructionSiteOverview: {
        screen: ConstructionSiteOverviewScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', texts.widgets.constructionSites)
        })
      },
      DataProvider: {
        screen: DataProviderScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', texts.dataProvider.partner)
        })
      },
      Detail: {
        screen: DetailScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', '')
        })
      },
      Form: {
        screen: FormScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', '')
        })
      },
      Home: {
        screen: HomeScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', texts.screenTitles.home)
        })
      },
      Html: {
        screen: HtmlScreen,
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
      Lunch: {
        screen: LunchScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', texts.widgets.lunch)
        })
      },
      Settings: {
        screen: SettingsScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', texts.screenTitles.settings)
        })
      },
      WasteCollection: {
        screen: WasteCollectionScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', texts.screenTitles.wasteCollection)
        })
      },
      WasteReminder: {
        screen: WasteReminderScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', texts.screenTitles.wasteCollection)
        })
      },
      Weather: {
        screen: WeatherScreen,
        navigationOptions: (props) => ({
          title: props.navigation.getParam('title', texts.screenTitles.weather)
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
