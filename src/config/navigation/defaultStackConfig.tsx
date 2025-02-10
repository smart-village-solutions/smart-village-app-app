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
  MapViewScreen,
  MultiButtonScreen,
  NestedInfoScreen,
  NoticeboardFormScreen,
  NoticeboardIndexScreen,
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
  ProfileNoticeboardFormScreen,
  ProfileNoticeboardIndexScreen,
  ProfileNoticeboardMemberIndexScreen,
  ProfileRegistrationScreen,
  ProfileResetPasswordScreen,
  ProfileSignupScreen,
  ProfileUpdateScreen,
  SettingsScreen,
  SueHomeScreen,
  SueListScreen,
  SueMapScreen,
  SueMapViewScreen,
  SueReportScreen,
  SurveyDetailScreen,
  SurveyOverviewScreen,
  TilesScreen,
  VolunteerDetailScreen,
  VolunteerFormScreen,
  VolunteerHomeScreen,
  VolunteerIndexScreen,
  VolunteerLoginScreen,
  VolunteerLogoutScreen,
  VolunteerMeScreen,
  VolunteerPersonalScreen,
  VolunteerRegisteredScreen,
  VolunteerRegistrationScreen,
  VolunteerSignupScreen,
  VoucherDetailScreen,
  VoucherHomeScreen,
  VoucherIndexScreen,
  VoucherLoginScreen,
  VoucherScannerScreen,
  WasteCollectionScreen,
  WasteReminderScreen,
  WeatherScreen,
  WebScreen,
  getTilesScreen,
  WhistleblowCodeScreen,
  WhistleblowFormScreen
} from '../../screens';
import {
  DetailScreen as BBBUSDetailScreen,
  IndexScreen as BBBUSIndexScreen
} from '../../screens/BB-BUS';
import { ScreenName, StackConfig } from '../../types';
import { consts } from '../consts';
import { texts } from '../texts';

const { MATOMO_TRACKING } = consts;

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
      initialParams,
      routeName: ScreenName.About,
      screenComponent: AboutScreen,
      screenOptions: { title: texts.screenTitles.about }
    },
    {
      initialParams,
      routeName: ScreenName.ARInfo,
      screenComponent: ARInfoScreen,
      screenOptions: { title: texts.augmentedReality.arInfoScreen.header }
    },
    {
      initialParams,
      routeName: ScreenName.ARShow,
      screenComponent: ARShowScreen,
      screenOptions: { headerShown: false }
    },
    {
      initialParams,
      routeName: ScreenName.ArtworkDetail,
      screenComponent: ArtworkDetailScreen,
      screenOptions: { title: texts.augmentedReality.artworkDetailScreen.header }
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
      initialParams: initialParams || {
        title: texts.screenTitles.favorites
      },
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
      initialParams,
      routeName: ScreenName.ConsulHomeScreen,
      screenComponent: ConsulHomeScreen,
      screenOptions: { title: texts.screenTitles.consul.home }
    },
    {
      initialParams,
      routeName: ScreenName.ConsulRegisterScreen,
      screenComponent: ConsulRegisterScreen,
      screenOptions: { title: texts.screenTitles.consul.register }
    },
    {
      initialParams,
      routeName: ScreenName.ConsulRegisteredScreen,
      screenComponent: ConsulRegisteredScreen,
      screenOptions: { title: texts.screenTitles.consul.register }
    },
    {
      initialParams,
      routeName: ScreenName.ConsulLoginScreen,
      screenComponent: ConsulLoginScreen,
      screenOptions: { title: texts.screenTitles.consul.login }
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
      initialParams,
      routeName: ScreenName.ConstructionSiteDetail,
      screenComponent: ConstructionSiteDetailScreen,
      screenOptions: { title: texts.screenTitles.constructionSite }
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
      initialParams,
      routeName: ScreenName.EncounterData,
      screenComponent: EncounterDataScreen,
      screenOptions: { title: texts.screenTitles.encounterHome }
    },
    {
      initialParams,
      routeName: ScreenName.EncounterHome,
      screenComponent: EncounterHomeScreen,
      screenOptions: { title: texts.screenTitles.encounterHome }
    },
    {
      initialParams,
      routeName: ScreenName.EncounterRegistration,
      screenComponent: EncounterRegistrationScreen,
      screenOptions: { title: texts.screenTitles.encounterHome }
    },
    {
      initialParams,
      routeName: ScreenName.EncounterScanner,
      screenComponent: EncounterScannerScreen,
      screenOptions: { title: texts.screenTitles.encounterHome }
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
              // @ts-expect-error we are lacking proper param types here
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
      initialParams,
      routeName: ScreenName.EventSuggestion,
      screenComponent: EventSuggestionScreen,
      screenOptions: { title: texts.screenTitles.eventSuggestion }
    },
    {
      initialParams,
      routeName: ScreenName.Form,
      screenComponent: FeedbackScreen,
      screenOptions: { title: texts.screenTitles.feedback }
    },
    {
      initialParams,
      routeName: ScreenName.Feedback,
      screenComponent: FeedbackScreen,
      screenOptions: { title: texts.screenTitles.feedback }
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
      routeName: ScreenName.Index,
      screenComponent: IndexScreen,
      screenOptions: getScreenOptions({ withInfo: true }),
      // NOTE: is used as initial screen for the points of interest tab
      initialParams: initialParams || {
        title: texts.screenTitles.pointsOfInterest,
        query: QUERY_TYPES.CATEGORIES,
        usedAsInitialScreen: true
      }
    },
    {
      initialParams,
      routeName: ScreenName.Lunch,
      screenComponent: LunchScreen
    },
    {
      initialParams,
      routeName: ScreenName.MapView,
      screenComponent: MapViewScreen,
      screenOptions: { title: texts.screenTitles.mapView }
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
      screenOptions: getScreenOptions({ withInfo: true })
    },
    {
      initialParams,
      routeName: ScreenName.Noticeboard,
      screenComponent: NoticeboardIndexScreen,
      screenOptions: getScreenOptions({ withInfo: true })
    },
    {
      initialParams,
      routeName: ScreenName.NoticeboardForm,
      screenComponent: NoticeboardFormScreen
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
      routeName: ScreenName.Profile,
      screenComponent: ProfileHomeScreen,
      screenOptions: getScreenOptions({ withInfo: true }),
      initialParams: initialParams || {
        title: texts.screenTitles.profile.home,
        query: QUERY_TYPES.PUBLIC_JSON_FILE,
        queryVariables: {
          name: 'profile'
        },
        rootRouteName: ScreenName.Profile
      }
    },
    {
      initialParams,
      routeName: ScreenName.ProfileConversations,
      screenComponent: ProfileConversationsScreen
    },
    {
      initialParams,
      routeName: ScreenName.ProfileDelete,
      screenComponent: ProfileDeleteScreen,
      screenOptions: { title: texts.screenTitles.profile.home }
    },
    {
      initialParams,
      routeName: ScreenName.ProfileEditMail,
      screenComponent: ProfileEditMailScreen,
      screenOptions: { title: texts.screenTitles.profile.home }
    },
    {
      initialParams,
      routeName: ScreenName.ProfileEditPassword,
      screenComponent: ProfileEditPasswordScreen,
      screenOptions: { title: texts.screenTitles.profile.home }
    },
    {
      initialParams,
      routeName: ScreenName.ProfileLogin,
      screenComponent: ProfileLoginScreen,
      screenOptions: { title: texts.screenTitles.profile.home }
    },
    {
      initialParams,
      routeName: ScreenName.ProfileMessaging,
      screenComponent: ProfileMessagingScreen
    },
    {
      initialParams,
      routeName: ScreenName.ProfileNoticeboard,
      screenComponent: ProfileNoticeboardIndexScreen,
      screenOptions: getScreenOptions({ withInfo: true })
    },
    {
      initialParams,
      routeName: ScreenName.ProfileNoticeboardForm,
      screenComponent: ProfileNoticeboardFormScreen
    },
    {
      initialParams,
      routeName: ScreenName.ProfileNoticeboardMemberIndex,
      screenComponent: ProfileNoticeboardMemberIndexScreen
    },
    {
      initialParams,
      routeName: ScreenName.ProfileRegistration,
      screenComponent: ProfileRegistrationScreen,
      screenOptions: { title: texts.screenTitles.profile.home }
    },
    {
      initialParams,
      routeName: ScreenName.ProfileResetPassword,
      screenComponent: ProfileResetPasswordScreen,
      screenOptions: { title: texts.screenTitles.profile.home }
    },
    {
      initialParams,
      routeName: ScreenName.ProfileSignup,
      screenComponent: ProfileSignupScreen,
      screenOptions: { title: texts.screenTitles.profile.home }
    },
    {
      initialParams,
      routeName: ScreenName.ProfileUpdate,
      screenComponent: ProfileUpdateScreen,
      screenOptions: { title: texts.screenTitles.profile.home }
    },
    {
      initialParams,
      routeName: ScreenName.Service,
      screenComponent: getTilesScreen(
        tilesScreenParams || {
          matomoString: MATOMO_TRACKING.SCREEN_VIEW.SERVICE,
          staticJsonName: 'homeService',
          titleFallback: texts.homeTitles.service,
          titleKey: 'headlineService',
          imageKey: 'headlineServiceImage'
        }
      ),
      screenOptions: { title: texts.screenTitles.service }
    },
    {
      initialParams: initialParams || { title: texts.screenTitles.settings },
      routeName: ScreenName.Settings,
      screenComponent: SettingsScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer })
    },
    {
      initialParams: initialParams || {
        title: texts.screenTitles.home
      },
      routeName: ScreenName.SueHome,
      screenComponent: SueHomeScreen
    },
    {
      initialParams: initialParams || {
        title: texts.screenTitles.sue.listView,
        query: QUERY_TYPES.SUE.REQUESTS,
        usedAsInitialScreen: true
      },
      routeName: ScreenName.SueList,
      screenComponent: SueListScreen
    },
    {
      initialParams: initialParams || {
        title: texts.screenTitles.sue.mapView,
        query: QUERY_TYPES.SUE.REQUESTS,
        usedAsInitialScreen: true
      },
      routeName: ScreenName.SueMap,
      screenComponent: SueMapScreen
    },
    {
      initialParams: initialParams || {
        title: texts.screenTitles.sue.reportView,
        query: QUERY_TYPES.SUE.REQUESTS,
        usedAsInitialScreen: true
      },
      routeName: ScreenName.SueReport,
      screenComponent: SueReportScreen
    },
    {
      initialParams,
      routeName: ScreenName.SueReportMapView,
      screenComponent: SueMapViewScreen,
      screenOptions: { title: texts.screenTitles.mapView }
    },
    {
      initialParams,
      routeName: ScreenName.SurveyDetail,
      screenComponent: SurveyDetailScreen,
      screenOptions: { title: texts.screenTitles.survey }
    },
    {
      initialParams,
      routeName: ScreenName.SurveyOverview,
      screenComponent: SurveyOverviewScreen,
      screenOptions: { title: texts.screenTitles.surveys }
    },
    {
      initialParams,
      routeName: ScreenName.TilesScreen,
      screenComponent: TilesScreen,
      screenOptions: getScreenOptions({ withInfo: true })
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
      initialParams: initialParams || {
        title: texts.screenTitles.volunteer.home
      },
      routeName: ScreenName.VolunteerHome,
      screenComponent: VolunteerHomeScreen
    },
    {
      initialParams,
      routeName: ScreenName.VolunteerIndex,
      screenComponent: VolunteerIndexScreen
    },
    {
      initialParams,
      routeName: ScreenName.VolunteerLogin,
      screenComponent: VolunteerLoginScreen,
      screenOptions: { title: texts.screenTitles.volunteer.home }
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
      initialParams,
      routeName: ScreenName.VolunteerPersonal,
      screenComponent: VolunteerPersonalScreen,
      screenOptions: { title: texts.screenTitles.volunteer.personal }
    },
    {
      initialParams,
      routeName: ScreenName.VolunteerRegistered,
      screenComponent: VolunteerRegisteredScreen,
      screenOptions: { title: texts.screenTitles.volunteer.home }
    },
    {
      initialParams,
      routeName: ScreenName.VolunteerRegistration,
      screenComponent: VolunteerRegistrationScreen,
      screenOptions: { title: texts.screenTitles.volunteer.home }
    },
    {
      initialParams,
      routeName: ScreenName.VolunteerSignup,
      screenComponent: VolunteerSignupScreen,
      screenOptions: { title: texts.screenTitles.volunteer.home }
    },
    {
      initialParams,
      routeName: ScreenName.VoucherDetail,
      screenComponent: VoucherDetailScreen,
      screenOptions: getScreenOptions({ withBookmark: false })
    },
    {
      initialParams,
      routeName: ScreenName.VoucherHome,
      screenComponent: VoucherHomeScreen,
      screenOptions: { title: texts.screenTitles.voucher.home }
    },
    {
      initialParams,
      routeName: ScreenName.VoucherIndex,
      screenComponent: VoucherIndexScreen
    },
    {
      initialParams,
      routeName: ScreenName.VoucherLogin,
      screenComponent: VoucherLoginScreen,
      screenOptions: { title: texts.screenTitles.voucher.home }
    },
    {
      initialParams,
      routeName: ScreenName.VoucherScanner,
      screenComponent: VoucherScannerScreen,
      screenOptions: { title: texts.screenTitles.voucher.qr }
    },
    {
      initialParams,
      routeName: ScreenName.WasteCollection,
      screenComponent: WasteCollectionScreen,
      screenOptions: { title: texts.screenTitles.wasteCollection }
    },
    {
      initialParams,
      routeName: ScreenName.WasteReminder,
      screenComponent: WasteReminderScreen,
      screenOptions: { title: texts.screenTitles.wasteCollection }
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
