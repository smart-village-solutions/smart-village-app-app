import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationOptions } from '@react-navigation/stack';

export enum ScreenName {
  About = 'About',
  BBBUSDetail = 'BBBUSDetail',
  BBBUSIndex = 'BBBUSIndex',
  BookmarkCategory = 'BookmarkCategory',
  Bookmarks = 'Bookmarks',
  Category = 'Category',
  Company = 'Company',
  ConstructionSiteDetail = 'ConstructionSiteDetail',
  ConstructionSiteOverview = 'ConstructionSiteOverview',
  DataProvider = 'DataProvider',
  Detail = 'Detail',
  EncounterData = 'EncounterData',
  EncounterHome = 'EncounterHome',
  EncounterRegistration = 'EncounterRegistration',
  EncounterScanner = 'EncounterScanner',
  EncounterUserDetail = 'EncounterUserDetail',
  Feedback = 'Feedback',
  Form = 'Form',
  Home = 'Home',
  Html = 'Html',
  Index = 'Index',
  Lunch = 'Lunch',
  MultiButton = 'MultiButton',
  NestedInfo = 'NestedInfo',
  OParlCalendar = 'OParlCalendar',
  OParlDetail = 'OParlDetail',
  OParlOrganizations = 'OParlOrganizations',
  OParlOverview = 'OParlOverview',
  OParlPersons = 'OParlPersons',
  OParlSearch = 'OParlSearch',
  Service = 'Service',
  Settings = 'Settings',
  SurveyDetail = 'SurveyDetail',
  SurveyOverview = 'SurveyOverview',
  WasteCollection = 'WasteCollection',
  WasteReminder = 'WasteReminder',
  Weather = 'Weather',
  Web = 'Web'
}

export type ScreenOptions =
  | StackNavigationOptions
  | ((props: {
      // eslint-disable-next-line @typescript-eslint/ban-types
      route: RouteProp<Record<string, object | undefined>, string>;
      navigation: any;
    }) => StackNavigationOptions)
  | undefined;

export type TabOptions =
  | BottomTabNavigationOptions
  | ((props: {
      // eslint-disable-next-line @typescript-eslint/ban-types
      route: RouteProp<Record<string, object | undefined>, string>;
      navigation: any;
    }) => BottomTabNavigationOptions)
  | undefined;

export type ScreenConfig = {
  routeName: ScreenName;
  screenComponent: (props: { navigation: any; route: any }) => JSX.Element | null;
  screenOptions?: ScreenOptions;
  // eslint-disable-next-line @typescript-eslint/ban-types
  inititalParams?: Object;
};

export type StackConfig = {
  initialRouteName: ScreenName;
  screenOptions?: ScreenOptions;
  screenConfigs: ScreenConfig[];
};

export type TabConfig = {
  stackConfig: StackConfig;
  tabOptions: TabOptions;
};

export type TabNavigatorConfig = {
  activeTintColor: string;
  inactiveTintColor: string;
  tabConfigs: TabConfig[];
};

export type NavigatorConfig = { type: 'drawer' } | { type: 'tab'; config: TabNavigatorConfig };
