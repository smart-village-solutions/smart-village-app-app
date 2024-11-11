import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationOptions } from '@react-navigation/stack';

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
  ProfileEditMail = 'ProfileEditMail',
  ProfileEditPassword = 'ProfileEditPassword',
  ProfileLogin = 'ProfileLogin',
  ProfileMessaging = 'ProfileMessaging',
  ProfileRegistration = 'ProfileRegistration',
  ProfileResetPassword = 'ProfileResetPassword',
  ProfileSignup = 'ProfileSignup',
  ProfileUpdate = 'ProfileUpdate',
  Service = 'Service',
  Settings = 'Settings',
  SueList = 'SueList',
  SueMap = 'SueMap',
  SueReport = 'SueReport',
  SueReportMapView = 'SueReportMapView',
  SurveyDetail = 'SurveyDetail',
  SurveyOverview = 'SurveyOverview',
  TilesScreen = 'TilesScreen',
  VolunteerDetail = 'VolunteerDetail',
  VolunteerForm = 'VolunteerForm',
  VolunteerHome = 'VolunteerHome',
  VolunteerIndex = 'VolunteerIndex',
  VolunteerLogin = 'VolunteerLogin',
  VolunteerLogout = 'VolunteerLogout',
  VolunteerMe = 'VolunteerMe',
  VolunteerPersonal = 'VolunteerPersonal',
  VolunteerRegistered = 'VolunteerRegistered',
  VolunteerRegistration = 'VolunteerRegistration',
  VolunteerSignup = 'VolunteerSignup',
  VoucherDetail = 'VoucherDetail',
  VoucherHome = 'VoucherHome',
  VoucherIndex = 'VoucherIndex',
  VoucherLogin = 'VoucherLogin',
  VoucherScanner = 'VoucherScanner',
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
  initialParams?: Object;
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
  activeBackgroundColor: string;
  inactiveBackgroundColor: string;
  tabConfigs: TabConfig[];
};

export type NavigatorConfig = { type: 'drawer' } | { type: 'tab'; config: TabNavigatorConfig };
