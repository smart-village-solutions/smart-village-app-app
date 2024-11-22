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
  SettingsScreen,
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
  initialRouteName,
  isDrawer
}: {
  initialRouteName: ScreenName;
  isDrawer: boolean;
}): StackConfig => ({
  initialRouteName,
  screenOptions: getScreenOptions({ withDrawer: isDrawer }),
  screenConfigs: [
    {
      routeName: ScreenName.About,
      screenComponent: AboutScreen,
      screenOptions: { title: texts.screenTitles.about }
    },
    {
      routeName: ScreenName.ARInfo,
      screenComponent: ARInfoScreen,
      screenOptions: { title: texts.augmentedReality.arInfoScreen.header }
    },
    {
      routeName: ScreenName.ARShow,
      screenComponent: ARShowScreen,
      screenOptions: { headerShown: false }
    },
    {
      routeName: ScreenName.ArtworkDetail,
      screenComponent: ArtworkDetailScreen,
      screenOptions: { title: texts.augmentedReality.artworkDetailScreen.header }
    },
    {
      routeName: ScreenName.BBBUSIndex,
      screenComponent: BBBUSIndexScreen
    },
    {
      routeName: ScreenName.BBBUSDetail,
      screenComponent: BBBUSDetailScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withShare: true })
    },
    {
      routeName: ScreenName.BookmarkCategory,
      screenComponent: BookmarkCategoryScreen
    },
    {
      routeName: ScreenName.Bookmarks,
      screenComponent: BookmarkScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer })
    },
    {
      routeName: ScreenName.Category,
      screenComponent: IndexScreen
    },
    {
      routeName: ScreenName.ConsulHomeScreen,
      screenComponent: ConsulHomeScreen,
      screenOptions: { title: texts.screenTitles.consul.home }
    },
    {
      routeName: ScreenName.ConsulRegisterScreen,
      screenComponent: ConsulRegisterScreen,
      screenOptions: { title: texts.screenTitles.consul.register }
    },
    {
      routeName: ScreenName.ConsulRegisteredScreen,
      screenComponent: ConsulRegisteredScreen,
      screenOptions: { title: texts.screenTitles.consul.register }
    },
    {
      routeName: ScreenName.ConsulLoginScreen,
      screenComponent: ConsulLoginScreen,
      screenOptions: { title: texts.screenTitles.consul.login }
    },
    {
      routeName: ScreenName.ConsulIndexScreen,
      screenComponent: ConsulIndexScreen
    },
    {
      routeName: ScreenName.ConsulDetailScreen,
      screenComponent: ConsulDetailScreen
    },
    {
      routeName: ScreenName.ConsulStartNewScreen,
      screenComponent: ConsulStartNewScreen
    },
    {
      routeName: ScreenName.Company,
      screenComponent: getTilesScreen({
        matomoString: MATOMO_TRACKING.SCREEN_VIEW.COMPANY,
        staticJsonName: 'homeCompanies',
        titleFallback: texts.homeTitles.company,
        titleKey: 'headlineCompany',
        imageKey: 'headlineCompanyImage'
      }),
      screenOptions: { title: texts.screenTitles.company }
    },
    {
      routeName: ScreenName.ConstructionSiteDetail,
      screenComponent: ConstructionSiteDetailScreen,
      screenOptions: { title: texts.screenTitles.constructionSite }
    },
    {
      routeName: ScreenName.ConstructionSiteOverview,
      screenComponent: ConstructionSiteOverviewScreen
    },
    {
      routeName: ScreenName.DataProvider,
      screenComponent: DataProviderScreen
    },
    {
      routeName: ScreenName.DefectReportForm,
      screenComponent: DefectReportFormScreen
    },
    {
      routeName: ScreenName.Detail,
      screenComponent: DetailScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withBookmark: true, withShare: true })
    },
    {
      routeName: ScreenName.DocIcons,
      screenComponent: DocIconsScreen
    },
    {
      routeName: ScreenName.EncounterData,
      screenComponent: EncounterDataScreen,
      screenOptions: { title: texts.screenTitles.encounterHome }
    },
    {
      routeName: ScreenName.EncounterHome,
      screenComponent: EncounterHomeScreen,
      screenOptions: { title: texts.screenTitles.encounterHome }
    },
    {
      routeName: ScreenName.EncounterRegistration,
      screenComponent: EncounterRegistrationScreen,
      screenOptions: { title: texts.screenTitles.encounterHome }
    },
    {
      routeName: ScreenName.EncounterScanner,
      screenComponent: EncounterScannerScreen,
      screenOptions: { title: texts.screenTitles.encounterHome }
    },
    {
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
      routeName: ScreenName.Events,
      screenComponent: IndexScreen,
      initialParams: {
        title: texts.screenTitles.events,
        query: QUERY_TYPES.EVENT_RECORDS,
        queryVariables: { limit: 15, order: 'listDate_ASC' }
      }
    },
    {
      routeName: ScreenName.Form,
      screenComponent: FeedbackScreen,
      screenOptions: { title: texts.screenTitles.feedback }
    },
    {
      routeName: ScreenName.Feedback,
      screenComponent: FeedbackScreen,
      screenOptions: { title: texts.screenTitles.feedback }
    },
    {
      routeName: ScreenName.Home,
      screenComponent: HomeScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withFavorites: true }),
      initialParams: {
        isDrawer,
        title: texts.screenTitles.home
      }
    },
    {
      routeName: ScreenName.Html,
      screenComponent: HtmlScreen
    },
    {
      routeName: ScreenName.Index,
      screenComponent: IndexScreen,
      // NOTE: is used as initial screen for the points of interest tab
      initialParams: {
        title: texts.screenTitles.pointsOfInterest,
        query: QUERY_TYPES.CATEGORIES,
        usedAsInitialScreen: true
      }
    },
    {
      routeName: ScreenName.Lunch,
      screenComponent: LunchScreen
    },
    {
      routeName: ScreenName.MapView,
      screenComponent: MapViewScreen,
      screenOptions: { title: texts.screenTitles.mapView }
    },
    {
      routeName: ScreenName.MultiButton,
      screenComponent: MultiButtonScreen
    },
    {
      routeName: ScreenName.NestedInfo,
      screenComponent: NestedInfoScreen
    },
    {
      routeName: ScreenName.NoticeboardForm,
      screenComponent: NoticeboardFormScreen
    },
    {
      routeName: ScreenName.Noticeboard,
      screenComponent: NoticeboardIndexScreen
    },
    {
      routeName: ScreenName.OParlCalendar,
      screenComponent: OParlCalendarScreen
    },
    {
      routeName: ScreenName.OParlDetail,
      screenComponent: OParlDetailScreen
    },
    {
      routeName: ScreenName.OParlOrganizations,
      screenComponent: OParlOrganizationsScreen
    },
    {
      routeName: ScreenName.OParlOverview,
      screenComponent: OParlOverviewScreen
    },
    {
      routeName: ScreenName.OParlPersons,
      screenComponent: OParlPersonsScreen
    },
    {
      routeName: ScreenName.OParlSearch,
      screenComponent: OParlSearchScreen
    },
    {
      routeName: ScreenName.Pdf,
      screenComponent: PdfScreen
    },
    {
      routeName: ScreenName.Service,
      screenComponent: getTilesScreen({
        matomoString: MATOMO_TRACKING.SCREEN_VIEW.SERVICE,
        staticJsonName: 'homeService',
        titleFallback: texts.homeTitles.service,
        titleKey: 'headlineService',
        imageKey: 'headlineServiceImage'
      }),
      screenOptions: { title: texts.screenTitles.service }
    },
    {
      routeName: ScreenName.Settings,
      screenComponent: SettingsScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer }),
      initialParams: { title: texts.screenTitles.settings }
    },
    {
      routeName: ScreenName.SueList,
      screenComponent: SueListScreen,
      initialParams: {
        title: texts.screenTitles.sue.listView,
        query: QUERY_TYPES.SUE.REQUESTS,
        usedAsInitialScreen: true
      }
    },
    {
      routeName: ScreenName.SueMap,
      screenComponent: SueMapScreen,
      initialParams: {
        title: texts.screenTitles.sue.mapView,
        query: QUERY_TYPES.SUE.REQUESTS,
        usedAsInitialScreen: true
      }
    },
    {
      routeName: ScreenName.SueReport,
      screenComponent: SueReportScreen,
      initialParams: {
        title: texts.screenTitles.sue.reportView,
        query: QUERY_TYPES.SUE.REQUESTS,
        usedAsInitialScreen: true
      }
    },
    {
      routeName: ScreenName.SueReportMapView,
      screenComponent: SueMapViewScreen,
      screenOptions: { title: texts.screenTitles.mapView }
    },
    {
      routeName: ScreenName.SurveyDetail,
      screenComponent: SurveyDetailScreen,
      screenOptions: { title: texts.screenTitles.survey }
    },
    {
      routeName: ScreenName.SurveyOverview,
      screenComponent: SurveyOverviewScreen,
      screenOptions: { title: texts.screenTitles.surveys }
    },
    {
      routeName: ScreenName.TilesScreen,
      screenComponent: TilesScreen
    },
    {
      routeName: ScreenName.VolunteerDetail,
      screenComponent: VolunteerDetailScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withShare: true })
    },
    {
      routeName: ScreenName.VolunteerForm,
      screenComponent: VolunteerFormScreen
    },
    {
      routeName: ScreenName.VolunteerHome,
      screenComponent: VolunteerHomeScreen,
      initialParams: {
        title: texts.screenTitles.volunteer.home
      }
    },
    {
      routeName: ScreenName.VolunteerIndex,
      screenComponent: VolunteerIndexScreen
    },
    {
      routeName: ScreenName.VolunteerLogin,
      screenComponent: VolunteerLoginScreen,
      screenOptions: { title: texts.screenTitles.volunteer.home }
    },
    {
      routeName: ScreenName.VolunteerLogout,
      screenComponent: VolunteerLogoutScreen,
      screenOptions: getScreenOptions({
        noHeaderLeft: true,
        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
      })
    },
    {
      routeName: ScreenName.VolunteerMe,
      screenComponent: VolunteerMeScreen
    },
    {
      routeName: ScreenName.VolunteerPersonal,
      screenComponent: VolunteerPersonalScreen,
      screenOptions: { title: texts.screenTitles.volunteer.personal }
    },
    {
      routeName: ScreenName.VolunteerRegistered,
      screenComponent: VolunteerRegisteredScreen,
      screenOptions: { title: texts.screenTitles.volunteer.home }
    },
    {
      routeName: ScreenName.VolunteerRegistration,
      screenComponent: VolunteerRegistrationScreen,
      screenOptions: { title: texts.screenTitles.volunteer.home }
    },
    {
      routeName: ScreenName.VolunteerSignup,
      screenComponent: VolunteerSignupScreen,
      screenOptions: { title: texts.screenTitles.volunteer.home }
    },
    {
      routeName: ScreenName.VoucherDetail,
      screenComponent: VoucherDetailScreen,
      screenOptions: getScreenOptions({ withBookmark: false })
    },
    {
      routeName: ScreenName.VoucherHome,
      screenComponent: VoucherHomeScreen,
      screenOptions: { title: texts.screenTitles.voucher.home }
    },
    {
      routeName: ScreenName.VoucherIndex,
      screenComponent: VoucherIndexScreen
    },
    {
      routeName: ScreenName.VoucherLogin,
      screenComponent: VoucherLoginScreen,
      screenOptions: { title: texts.screenTitles.voucher.home }
    },
    {
      routeName: ScreenName.VoucherScanner,
      screenComponent: VoucherScannerScreen,
      screenOptions: { title: texts.screenTitles.voucher.qr }
    },
    {
      routeName: ScreenName.WasteCollection,
      screenComponent: WasteCollectionScreen,
      screenOptions: { title: texts.screenTitles.wasteCollection }
    },
    {
      routeName: ScreenName.WasteReminder,
      screenComponent: WasteReminderScreen,
      screenOptions: { title: texts.screenTitles.wasteCollection }
    },
    {
      routeName: ScreenName.Weather,
      screenComponent: WeatherScreen
    },
    {
      routeName: ScreenName.Web,
      screenComponent: WebScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withShare: true })
    },
    {
      routeName: ScreenName.WhistleblowCode,
      screenComponent: WhistleblowCodeScreen
    },
    {
      routeName: ScreenName.WhistleblowForm,
      screenComponent: WhistleblowFormScreen
    }
  ]
});
