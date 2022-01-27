import React from 'react';

import { HeaderLeft } from '../../components';
import { getScreenOptions } from '../../navigation/screenOptions';
import {
  AboutScreen,
  BookmarkCategoryScreen,
  BookmarkScreen,
  ConstructionSiteDetailScreen,
  ConstructionSiteOverviewScreen,
  DataProviderScreen,
  DetailScreen,
  EncounterDataScreen,
  EncounterHomeScreen,
  EncounterRegistrationScreen,
  EncounterScannerScreen,
  EncounterUserDetailScreen,
  FeedbackScreen,
  getTilesScreen,
  HomeScreen,
  HtmlScreen,
  IndexScreen,
  LunchScreen,
  MultiButtonScreen,
  NestedInfoScreen,
  OParlCalendarScreen,
  OParlDetailScreen,
  OParlOrganizationsScreen,
  OParlOverviewScreen,
  OParlPersonsScreen,
  OParlSearchScreen,
  SettingsScreen,
  SurveyDetailScreen,
  SurveyOverviewScreen,
  VolunteerDetailScreen,
  VolunteerIndexScreen,
  VolunteerScreen,
  WasteCollectionScreen,
  WasteReminderScreen,
  WeatherScreen,
  WebScreen
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
      routeName: ScreenName.Company,
      screenComponent: getTilesScreen({
        matomoString: MATOMO_TRACKING.SCREEN_VIEW.COMPANY,
        staticJsonName: 'homeCompanies',
        titleFallback: texts.homeTitles.company,
        titleKey: 'headlineCompany'
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
      routeName: ScreenName.Detail,
      screenComponent: DetailScreen,
      screenOptions: getScreenOptions({ withDrawer: isDrawer, withBookmark: true, withShare: true })
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
      inititalParams: {
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
      screenComponent: IndexScreen
    },
    {
      routeName: ScreenName.Lunch,
      screenComponent: LunchScreen
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
      routeName: ScreenName.Service,
      screenComponent: getTilesScreen({
        matomoString: MATOMO_TRACKING.SCREEN_VIEW.SERVICE,
        staticJsonName: 'homeService',
        titleFallback: texts.homeTitles.service,
        titleKey: 'headlineService'
      }),
      screenOptions: { title: texts.screenTitles.service }
    },
    {
      routeName: ScreenName.Settings,
      screenComponent: SettingsScreen,
      screenOptions: { title: texts.screenTitles.settings }
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
      routeName: ScreenName.VolunteerDetail,
      screenComponent: VolunteerDetailScreen
    },
    {
      routeName: ScreenName.VolunteerIndex,
      screenComponent: VolunteerIndexScreen
    },
    {
      routeName: ScreenName.Volunteer,
      screenComponent: VolunteerScreen,
      screenOptions: getScreenOptions({ withVolunteer: true }),
      inititalParams: {
        title: texts.screenTitles.volunteer.home
      }
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
    }
  ]
});
