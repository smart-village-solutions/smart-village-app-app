import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationOptions } from '@react-navigation/stack';
import { ViewStyle } from 'react-native';

import { Icon } from '../config';

export enum ScreenName {
  About = 'About',
  ARShow = 'ARShow',
  ARInfo = 'ARInfo',
  ArtworkDetail = 'ArtworkDetail',
  BBBUSDetail = 'BBBUSDetail',
  BBBUSIndex = 'BBBUSIndex',
  BookmarkCategory = 'BookmarkCategory',
  Bookmarks = 'Bookmarks',
  Category = 'Category',
  CitySelection = 'CitySelection',
  Company = 'Company',
  ConstructionSiteDetail = 'ConstructionSiteDetail',
  ConstructionSiteOverview = 'ConstructionSiteOverview',
  ConsulHomeScreen = 'ConsulHomeScreen',
  ConsulRegisterScreen = 'ConsulRegisterScreen',
  ConsulRegisteredScreen = 'ConsulRegisteredScreen',
  ConsulLoginScreen = 'ConsulLoginScreen',
  ConsulIndexScreen = 'ConsulIndexScreen',
  ConsulDetailScreen = 'ConsulDetailScreen',
  ConsulStartNewScreen = 'ConsulStartNewScreen',
  DefectReportForm = 'DefectReportForm',
  DataProvider = 'DataProvider',
  Detail = 'Detail',
  DocIcons = 'DocIcons',
  EncounterData = 'EncounterData',
  EncounterHome = 'EncounterHome',
  EncounterRegistration = 'EncounterRegistration',
  EncounterScanner = 'EncounterScanner',
  EncounterUserDetail = 'EncounterUserDetail',
  Events = 'Events',
  EventSuggestion = 'EventSuggestion',
  Feedback = 'Feedback',
  Form = 'Form',
  Home = 'Home',
  Html = 'Html',
  Index = 'Index',
  Lunch = 'Lunch',
  MapView = 'MapView',
  MultiButton = 'MultiButton',
  NestedInfo = 'NestedInfo',
  Noticeboard = 'Noticeboard',
  NoticeboardForm = 'NoticeboardForm',
  NoticeboardMemberIndex = 'NoticeboardMemberIndex',
  NoticeboardSuccess = 'NoticeboardSuccess',
  OParlCalendar = 'OParlCalendar',
  OParlDetail = 'OParlDetail',
  OParlOrganizations = 'OParlOrganizations',
  OParlOverview = 'OParlOverview',
  OParlPersons = 'OParlPersons',
  OParlSearch = 'OParlSearch',
  Pdf = 'Pdf',
  Profile = 'Profile',
  ProfileConversations = 'ProfileConversations',
  ProfileDelete = 'ProfileDelete',
  ProfileEditMail = 'ProfileEditMail',
  ProfileEditPassword = 'ProfileEditPassword',
  ProfileLogin = 'ProfileLogin',
  ProfileMessaging = 'ProfileMessaging',
  ProfileRegistration = 'ProfileRegistration',
  ProfileResetPassword = 'ProfileResetPassword',
  ProfileSignup = 'ProfileSignup',
  ProfileUpdate = 'ProfileUpdate',
  Search = 'Search',
  Service = 'Service',
  Settings = 'Settings',
  SueHome = 'SueHome',
  SueList = 'SueList',
  SueMap = 'SueMap',
  SueReport = 'SueReport',
  SueReportMapView = 'SueReportMapView',
  SurveyDetail = 'SurveyDetail',
  SurveyOverview = 'SurveyOverview',
  TilesScreen = 'TilesScreen',
  VolunteerDetail = 'VolunteerDetail',
  VolunteerForm = 'VolunteerForm',
  VolunteerGroupSearch = 'VolunteerGroupSearch',
  VolunteerHome = 'VolunteerHome',
  VolunteerIndex = 'VolunteerIndex',
  VolunteerLogin = 'VolunteerLogin',
  VolunteerLogout = 'VolunteerLogout',
  VolunteerMe = 'VolunteerMe',
  VolunteerPersonal = 'VolunteerPersonal',
  VolunteerRegistered = 'VolunteerRegistered',
  VolunteerRegistration = 'VolunteerRegistration',
  VolunteerSettings = 'VolunteerSettings',
  VolunteerSignup = 'VolunteerSignup',
  VoucherDetail = 'VoucherDetail',
  VoucherHome = 'VoucherHome',
  VoucherIndex = 'VoucherIndex',
  VoucherLogin = 'VoucherLogin',
  VoucherScanner = 'VoucherScanner',
  WasteCollection = 'WasteCollection',
  WasteCollectionSettings = 'WasteCollectionSettings',
  Weather = 'Weather',
  Web = 'Web',
  WhistleblowCode = 'WhistleblowCode',
  WhistleblowForm = 'WhistleblowForm'
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
  initialParams?: Object;
};

export type StackConfig = {
  initialRouteName: ScreenName;
  screenOptions?: ScreenOptions;
  screenConfigs: ScreenConfig[];
};

export type CustomTab = {
  accessibilityLabel: string;
  activeIconName?: keyof typeof Icon;
  iconLandscapeStyle?: ViewStyle;
  iconName: keyof typeof Icon;
  iconSize?: number;
  iconStyle?: ViewStyle;
  label: string;
  params?: Record<string, any>;
  screen: ScreenName;
  strokeColor?: string;
  strokeWidth?: number;
  tabBarLabelStyle?: ViewStyle;
  tilesScreenParams?: Record<string, any>;
};

export type TabConfig = {
  stackConfig: StackConfig;
  tabOptions: TabOptions;
};

export type TabNavigatorConfig = {
  activeTintColor: string;
  inactiveTintColor: string;
  activeBackgroundColor: string;
  inactiveBackgroundColor: string;
  tabConfigs: (CustomTab | string | TabConfig)[];
};

export type NavigatorConfig = { type: 'drawer' } | { type: 'tab' };
