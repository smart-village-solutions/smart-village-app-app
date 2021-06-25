import {
  defaultStackNavigatorScreenOptions,
  detailScreenOptions,
  homeScreenOptions,
  screenOptionsWithSettings,
  screenOptionsWithShare
} from '../../navigation/screenOptions';
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
  OParlCalendarScreen,
  OParlDetailScreen,
  OParlOrganizationsScreen,
  OParlOverviewScreen,
  OParlPersonsScreen,
  OParlSearchScreen,
  SettingsScreen,
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
import { texts } from '../texts';

export const defaultStackConfig = ({
  initialRouteName,
  headerRight
}: {
  initialRouteName: ScreenName;
  headerRight: boolean;
}): StackConfig => ({
  initialRouteName,
  screenOptions: defaultStackNavigatorScreenOptions(headerRight),
  screenConfigs: [
    {
      routeName: ScreenName.BBBUSIndex,
      screenComponent: BBBUSIndexScreen
    },
    {
      routeName: ScreenName.BBBUSDetail,
      screenComponent: BBBUSDetailScreen,
      screenOptions: screenOptionsWithShare(true)
    },
    {
      routeName: ScreenName.BookmarkCategory,
      screenComponent: BookmarkCategoryScreen
    },
    {
      routeName: ScreenName.Bookmarks,
      screenComponent: BookmarkScreen,
      screenOptions: screenOptionsWithSettings(true)
    },
    {
      routeName: ScreenName.Category,
      screenComponent: IndexScreen
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
      screenOptions: detailScreenOptions(true)
    },
    {
      routeName: ScreenName.Form,
      screenComponent: FormScreen
    },
    {
      routeName: ScreenName.Home,
      screenComponent: HomeScreen,
      screenOptions: homeScreenOptions(true)
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
      routeName: ScreenName.Settings,
      screenComponent: SettingsScreen,
      screenOptions: { title: texts.screenTitles.settings }
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
      screenComponent: WebScreen
    }
  ]
});
