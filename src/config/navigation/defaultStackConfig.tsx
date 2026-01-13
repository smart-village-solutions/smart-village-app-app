import { CardStyleInterpolators } from '@react-navigation/stack';
import React from 'react';

import { HeaderLeft } from '../../components';
import { getScreenOptions } from '../../navigation/screenOptions';
import { QUERY_TYPES } from '../../queries';
import {
  ARInfoScreen,
  ARShowScreen,
  AboutScreen,
  ArtworkDetailScreen,
  BookmarkCategoryScreen,
  BookmarkScreen,
  ChatbotScreen,
  CitySelectionScreen,
  ConstructionSiteDetailScreen,
  ConstructionSiteOverviewScreen,
  ConsulDetailScreen,
  ConsulHomeScreen,
  ConsulIndexScreen,
  ConsulLoginScreen,
  ConsulRegisterScreen,
  ConsulRegisteredScreen,
  ConsulStartNewScreen,
  DataProviderScreen,
  DefectReportFormScreen,
  DetailScreen,
  DocIconsScreen,
  EncounterDataScreen,
  EncounterHomeScreen,
  EncounterRegistrationScreen,
  EncounterScannerScreen,
  EncounterUserDetailScreen,
  EventSuggestionScreen,
  FeedbackScreen,
  HomeScreen,
  HtmlScreen,
  IndexScreen,
  LunchScreen,
  MapScreen,
  MultiButtonScreen,
  NestedInfoScreen,
  NoticeboardFormScreen,
  NoticeboardIndexScreen,
  NoticeboardMemberIndexScreen,
  OParlCalendarScreen,
  OParlDetailScreen,
  OParlOrganizationsScreen,
  OParlOverviewScreen,
  OParlPersonsScreen,
  OParlSearchScreen,
  PdfScreen,
  ProfileConversationsScreen,
  ProfileDeleteScreen,
  ProfileEditMailScreen,
  ProfileEditPasswordScreen,
  ProfileHomeScreen,
  ProfileLoginScreen,
  ProfileMessagingScreen,
  ProfileRegistrationScreen,
  ProfileResetPasswordScreen,
  ProfileSignupScreen,
  ProfileUpdateScreen,
  SearchScreen,
  SettingsScreen,
  SueHomeScreen,
  SueListScreen,
  SueMapScreen,
  SueReportScreen,
  SurveyDetailScreen,
  SurveyOverviewScreen,
  TilesScreen,
  VolunteerDetailScreen,
  VolunteerFormScreen,
  VolunteerGroupSearchScreen,
  VolunteerHomeScreen,
  VolunteerIndexScreen,
  VolunteerLoginScreen,
  VolunteerLogoutScreen,
  VolunteerMeScreen,
  VolunteerPersonalScreen,
  VolunteerRegisteredScreen,
  VolunteerRegistrationScreen,
  VolunteerSettingsScreen,
  VolunteerSignupScreen,
  VolunteerStreamScreen,
  VoucherDetailScreen,
  VoucherHomeScreen,
  VoucherIndexScreen,
  VoucherLoginScreen,
  VoucherScannerScreen,
  WasteCollectionScreen,
  WasteCollectionSettingsScreen,
  WeatherScreen,
  WebScreen,
  WhistleblowCodeScreen,
  WhistleblowFormScreen,
  getTilesScreen
} from '../../screens';
import {
  DetailScreen as BBBUSDetailScreen,
  IndexScreen as BBBUSIndexScreen
} from '../../screens/BB-BUS';
import { ScreenName, StackConfig } from '../../types';
import { consts } from '../consts';
import { texts } from '../texts';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
export const defaultStackConfig = ({
  initialParams,
  initialRouteName,
  isDrawer,
  tilesScreenParams
}: {
  initialParams?: Record<string, any>;
  initialRouteName: ScreenName;
  isDrawer: boolean;
  tilesScreenParams?: Record<string, any>;
}): StackConfig => ({
  initialRouteName,
  screenOptions: getScreenOptions({ withDrawer: isDrawer }),
  screenConfigs: [
    {
      initialParams: initialParams || { title: texts.screenTitles.about },
      routeName: ScreenName.About,
      screenComponent: AboutScreen
    },
    {
      initialParams: initialParams || { title: texts.augmentedReality.arInfoScreen.header },
      routeName: ScreenName.ARInfo,
      screenComponent: ARInfoScreen
    },
    {
      initialParams,
      routeName: ScreenName.ARShow,
      screenComponent: ARShowScreen,
      screenOptions: { headerShown: false }
    },
    {
      initialParams: initialParams || { title: texts.augmentedReality.artworkDetailScreen.header },
      routeName: ScreenName.ArtworkDetail,
      screenComponent: ArtworkDetailScreen
    },
    {
      initialParams,
      routeName: ScreenName.BBBUSIndex,
      screenComponent: BBBUSIndexScreen
    },
    {
      initialParams,
      routeName: ScreenName.BBBUSDetail,
      screenComponent: BBBUSDetailScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withShare: true })
    },
    {
      initialParams,
      routeName: ScreenName.BookmarkCategory,
      screenComponent: BookmarkCategoryScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.favorites },
      routeName: ScreenName.Bookmarks,
      screenComponent: BookmarkScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer })
    },
    {
      initialParams,
      routeName: ScreenName.Category,
      screenComponent: IndexScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.chatbot },
      routeName: ScreenName.Chatbot,
      screenComponent: ChatbotScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.myCity },
      routeName: ScreenName.CitySelection,
      screenComponent: CitySelectionScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.consul.home },
      routeName: ScreenName.ConsulHomeScreen,
      screenComponent: ConsulHomeScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.consul.register },
      routeName: ScreenName.ConsulRegisterScreen,
      screenComponent: ConsulRegisterScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.consul.register },
      routeName: ScreenName.ConsulRegisteredScreen,
      screenComponent: ConsulRegisteredScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.consul.login },
      routeName: ScreenName.ConsulLoginScreen,
      screenComponent: ConsulLoginScreen
    },
    {
      initialParams,
      routeName: ScreenName.ConsulIndexScreen,
      screenComponent: ConsulIndexScreen
    },
    {
      initialParams,
      routeName: ScreenName.ConsulDetailScreen,
      screenComponent: ConsulDetailScreen
    },
    {
      initialParams,
      routeName: ScreenName.ConsulStartNewScreen,
      screenComponent: ConsulStartNewScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.constructionSite },
      routeName: ScreenName.ConstructionSiteDetail,
      screenComponent: ConstructionSiteDetailScreen
    },
    {
      initialParams,
      routeName: ScreenName.ConstructionSiteOverview,
      screenComponent: ConstructionSiteOverviewScreen
    },
    {
      initialParams,
      routeName: ScreenName.DataProvider,
      screenComponent: DataProviderScreen
    },
    {
      initialParams,
      routeName: ScreenName.DefectReportForm,
      screenComponent: DefectReportFormScreen
    },
    {
      initialParams,
      routeName: ScreenName.Detail,
      screenComponent: DetailScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withBookmark: true, withShare: true })
    },
    {
      initialParams,
      routeName: ScreenName.DocIcons,
      screenComponent: DocIconsScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.encounterHome },
      routeName: ScreenName.EncounterData,
      screenComponent: EncounterDataScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.encounterHome },
      routeName: ScreenName.EncounterHome,
      screenComponent: EncounterHomeScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.encounterHome },
      routeName: ScreenName.EncounterRegistration,
      screenComponent: EncounterRegistrationScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.encounterHome },
      routeName: ScreenName.EncounterScanner,
      screenComponent: EncounterScannerScreen
    },
    {
      initialParams,
      routeName: ScreenName.EncounterUserDetail,
      screenComponent: EncounterUserDetailScreen,
      screenOptions: ({ navigation, route }) => ({
        title: texts.screenTitles.encounterHome,
        headerLeft: () => (
          <HeaderLeft
            onPress={() => {
              if (route.params?.qrId || route.params?.fromPoll) {
                navigation.goBack();
              } else {
                navigation.navigate(ScreenName.EncounterHome);
              }
            }}
          />
        )
      })
    },
    {
      initialParams: initialParams || {
        title: texts.screenTitles.events,
        query: QUERY_TYPES.EVENT_RECORDS,
        queryVariables: { limit: 15, order: 'listDate_ASC' }
      },
      routeName: ScreenName.Events,
      screenComponent: IndexScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.eventSuggestion },
      routeName: ScreenName.EventSuggestion,
      screenComponent: EventSuggestionScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.feedback },
      routeName: ScreenName.Form,
      screenComponent: FeedbackScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.feedback },
      routeName: ScreenName.Feedback,
      screenComponent: FeedbackScreen
    },
    {
      initialParams: initialParams || {
        isDrawer,
        title: texts.screenTitles.home
      },
      routeName: ScreenName.Home,
      screenComponent: HomeScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withFavorites: true })
    },
    {
      initialParams,
      routeName: ScreenName.Html,
      screenComponent: HtmlScreen
    },
    {
      initialParams: initialParams || {
        title: texts.screenTitles.pointsOfInterest,
        query: QUERY_TYPES.CATEGORIES
      },
      routeName: ScreenName.Index,
      screenComponent: IndexScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withInfo: true })
    },
    {
      initialParams,
      routeName: ScreenName.Lunch,
      screenComponent: LunchScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.map },
      routeName: ScreenName.Map,
      screenComponent: MapScreen
    },
    {
      // NOTE: fallback, if the route is given in some static content
      initialParams: initialParams || { title: texts.screenTitles.mapView },
      routeName: ScreenName.MapView,
      screenComponent: MapScreen
    },
    {
      initialParams,
      routeName: ScreenName.MultiButton,
      screenComponent: MultiButtonScreen
    },
    {
      initialParams,
      routeName: ScreenName.NestedInfo,
      screenComponent: NestedInfoScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withInfo: true })
    },
    {
      initialParams,
      routeName: ScreenName.Noticeboard,
      screenComponent: NoticeboardIndexScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withInfo: true })
    },
    {
      initialParams,
      routeName: ScreenName.NoticeboardForm,
      screenComponent: NoticeboardFormScreen
    },
    {
      initialParams,
      routeName: ScreenName.NoticeboardMemberIndex,
      screenComponent: NoticeboardMemberIndexScreen
    },
    {
      initialParams,
      routeName: ScreenName.OParlCalendar,
      screenComponent: OParlCalendarScreen
    },
    {
      initialParams,
      routeName: ScreenName.OParlDetail,
      screenComponent: OParlDetailScreen
    },
    {
      initialParams,
      routeName: ScreenName.OParlOrganizations,
      screenComponent: OParlOrganizationsScreen
    },
    {
      initialParams,
      routeName: ScreenName.OParlOverview,
      screenComponent: OParlOverviewScreen
    },
    {
      initialParams,
      routeName: ScreenName.OParlPersons,
      screenComponent: OParlPersonsScreen
    },
    {
      initialParams,
      routeName: ScreenName.OParlSearch,
      screenComponent: OParlSearchScreen
    },
    {
      initialParams,
      routeName: ScreenName.Pdf,
      screenComponent: PdfScreen
    },
    {
      initialParams: initialParams || {
        title: texts.screenTitles.profile.home,
        query: QUERY_TYPES.PUBLIC_JSON_FILE,
        queryVariables: {
          name: 'profile'
        },
        rootRouteName: ScreenName.Profile
      },
      routeName: ScreenName.Profile,
      screenComponent: ProfileHomeScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withInfo: true })
    },
    {
      initialParams,
      routeName: ScreenName.ProfileConversations,
      screenComponent: ProfileConversationsScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.profile.home },
      routeName: ScreenName.ProfileDelete,
      screenComponent: ProfileDeleteScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.profile.home },
      routeName: ScreenName.ProfileEditMail,
      screenComponent: ProfileEditMailScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.profile.home },
      routeName: ScreenName.ProfileEditPassword,
      screenComponent: ProfileEditPasswordScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.profile.home },
      routeName: ScreenName.ProfileLogin,
      screenComponent: ProfileLoginScreen
    },
    {
      initialParams,
      routeName: ScreenName.ProfileMessaging,
      screenComponent: ProfileMessagingScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.profile.home },
      routeName: ScreenName.ProfileRegistration,
      screenComponent: ProfileRegistrationScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.profile.home },
      routeName: ScreenName.ProfileResetPassword,
      screenComponent: ProfileResetPasswordScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.profile.home },
      routeName: ScreenName.ProfileSignup,
      screenComponent: ProfileSignupScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.profile.home },
      routeName: ScreenName.ProfileUpdate,
      screenComponent: ProfileUpdateScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.search },
      routeName: ScreenName.Search,
      screenComponent: SearchScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.service },
      routeName: ScreenName.Service,
      screenComponent: getTilesScreen(
        tilesScreenParams || {
          matomoString: MATOMO_TRACKING.SCREEN_VIEW.SERVICE,
          staticJsonName: 'homeService',
          titleFallback: texts.homeTitles.service,
          titleKey: 'headlineService',
          imageKey: 'headlineServiceImage'
        }
      )
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.settings },
      routeName: ScreenName.Settings,
      screenComponent: SettingsScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer })
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.home },
      routeName: ScreenName.SueHome,
      screenComponent: SueHomeScreen
    },
    {
      initialParams: initialParams || {
        title: texts.screenTitles.sue.listView,
        query: QUERY_TYPES.SUE.REQUESTS
      },
      routeName: ScreenName.SueList,
      screenComponent: SueListScreen
    },
    {
      initialParams: initialParams || {
        title: texts.screenTitles.sue.mapView,
        query: QUERY_TYPES.SUE.REQUESTS
      },
      routeName: ScreenName.SueMap,
      screenComponent: SueMapScreen
    },
    {
      initialParams: initialParams || {
        title: texts.screenTitles.sue.reportView,
        query: QUERY_TYPES.SUE.REQUESTS
      },
      routeName: ScreenName.SueReport,
      screenComponent: SueReportScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.sue.mapView },
      routeName: ScreenName.SueReportMapView,
      screenComponent: SueMapScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.survey },
      routeName: ScreenName.SurveyDetail,
      screenComponent: SurveyDetailScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.survey },
      routeName: ScreenName.SurveyOverview,
      screenComponent: SurveyOverviewScreen
    },
    {
      initialParams,
      routeName: ScreenName.TilesScreen,
      screenComponent: TilesScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withInfo: true })
    },
    {
      initialParams,
      routeName: ScreenName.VolunteerDetail,
      screenComponent: VolunteerDetailScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withShare: true })
    },
    {
      initialParams,
      routeName: ScreenName.VolunteerForm,
      screenComponent: VolunteerFormScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.volunteer.groupSearch },
      routeName: ScreenName.VolunteerGroupSearch,
      screenComponent: VolunteerGroupSearchScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.volunteer.home },
      routeName: ScreenName.VolunteerHome,
      screenComponent: VolunteerHomeScreen
    },
    {
      initialParams,
      routeName: ScreenName.VolunteerIndex,
      screenComponent: VolunteerIndexScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.volunteer.home },
      routeName: ScreenName.VolunteerLogin,
      screenComponent: VolunteerLoginScreen
    },
    {
      initialParams,
      routeName: ScreenName.VolunteerLogout,
      screenComponent: VolunteerLogoutScreen,
      screenOptions: getScreenOptions({
        noHeaderLeft: true,
        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
      })
    },
    {
      initialParams,
      routeName: ScreenName.VolunteerMe,
      screenComponent: VolunteerMeScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.volunteer.personal },
      routeName: ScreenName.VolunteerPersonal,
      screenComponent: VolunteerPersonalScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.volunteer.home },
      routeName: ScreenName.VolunteerRegistered,
      screenComponent: VolunteerRegisteredScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.volunteer.home },
      routeName: ScreenName.VolunteerRegistration,
      screenComponent: VolunteerRegistrationScreen
    },
    {
      initialParams,
      routeName: ScreenName.VolunteerSettings,
      screenComponent: VolunteerSettingsScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.volunteer.home },
      routeName: ScreenName.VolunteerSignup,
      screenComponent: VolunteerSignupScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.volunteer.home },
      routeName: ScreenName.VolunteerStream,
      screenComponent: VolunteerStreamScreen
    },
    {
      initialParams,
      routeName: ScreenName.VoucherDetail,
      screenComponent: VoucherDetailScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withBookmark: false })
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.voucher.home },
      routeName: ScreenName.VoucherHome,
      screenComponent: VoucherHomeScreen
    },
    {
      initialParams,
      routeName: ScreenName.VoucherIndex,
      screenComponent: VoucherIndexScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.voucher.home },
      routeName: ScreenName.VoucherLogin,
      screenComponent: VoucherLoginScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.voucher.qr },
      routeName: ScreenName.VoucherScanner,
      screenComponent: VoucherScannerScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.wasteCollection },
      routeName: ScreenName.WasteCollection,
      screenComponent: WasteCollectionScreen
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.wasteCollection },
      routeName: ScreenName.WasteCollectionSettings,
      screenComponent: WasteCollectionSettingsScreen
    },
    {
      initialParams,
      routeName: ScreenName.Weather,
      screenComponent: WeatherScreen
    },
    {
      initialParams,
      routeName: ScreenName.Web,
      screenComponent: WebScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withShare: true })
    },
    {
      initialParams,
      routeName: ScreenName.WhistleblowCode,
      screenComponent: WhistleblowCodeScreen
    },
    {
      initialParams,
      routeName: ScreenName.WhistleblowForm,
      screenComponent: WhistleblowFormScreen
    }
  ]
});
/* eslint-enable complexity */
