import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { texts } from '../config';
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
  SurveyDetailScreen,
  SurveyOverviewScreen,
  WasteCollectionScreen,
  WasteReminderScreen,
  WeatherScreen,
  WebScreen
} from '../screens';
import {
  DetailScreen as BBBUSDetailScreen,
  IndexScreen as BBBUSIndexScreen
} from '../screens/BB-BUS';
import {
  defaultStackNavigatorScreenOptions,
  detailScreenOptions,
  homeScreenOptions,
  screenOptionsWithSettings,
  screenOptionsWithShare
} from './screenOptions';

const Stack = createStackNavigator();

export const AppStackNavigator = (headerRight = true) => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={defaultStackNavigatorScreenOptions(headerRight)}
    >
      <Stack.Screen name="BBBUSIndex" component={BBBUSIndexScreen} />
      <Stack.Screen
        name="BBBUSDetail"
        component={BBBUSDetailScreen}
        options={screenOptionsWithShare(headerRight)}
      />
      <Stack.Screen
        name="Bookmarks"
        component={BookmarkScreen}
        options={screenOptionsWithSettings(headerRight)}
      />
      <Stack.Screen name="BookmarkCategory" component={BookmarkCategoryScreen} />
      <Stack.Screen name="Category" component={IndexScreen} />
      <Stack.Screen name="ConstructionSiteDetail" component={ConstructionSiteDetailScreen} />
      <Stack.Screen name="ConstructionSiteOverview" component={ConstructionSiteOverviewScreen} />
      <Stack.Screen name="DataProvider" component={DataProviderScreen} />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={detailScreenOptions(headerRight)}
      />
      <Stack.Screen name="Form" component={FormScreen} />
      <Stack.Screen name="Home" component={HomeScreen} options={homeScreenOptions(headerRight)} />
      <Stack.Screen name="Html" component={HtmlScreen} />
      <Stack.Screen name="Index" component={IndexScreen} />
      <Stack.Screen name="Lunch" component={LunchScreen} />
      <Stack.Screen name="OParlCalendar" component={OParlCalendarScreen} />
      <Stack.Screen name="OParlDetail" component={OParlDetailScreen} />
      <Stack.Screen name="OParlOrganizations" component={OParlOrganizationsScreen} />
      <Stack.Screen name="OParlOverview" component={OParlOverviewScreen} />
      <Stack.Screen name="OParlPersons" component={OParlPersonsScreen} />
      <Stack.Screen name="OParlSearch" component={OParlSearchScreen} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: texts.screenTitles.settings }}
      />
      <Stack.Screen
        name="SurveyDetail"
        component={SurveyDetailScreen}
        options={{ title: texts.screenTitles.survey }}
      />
      <Stack.Screen
        name="SurveyOverview"
        component={SurveyOverviewScreen}
        options={{ title: texts.screenTitles.surveys }}
      />
      <Stack.Screen
        name="WasteCollection"
        component={WasteCollectionScreen}
        options={{ title: texts.screenTitles.wasteCollection }}
      />
      <Stack.Screen
        name="WasteReminder"
        component={WasteReminderScreen}
        options={{ title: texts.screenTitles.wasteCollection }}
      />
      <Stack.Screen name="Weather" component={WeatherScreen} />
      <Stack.Screen name="Web" component={WebScreen} />
    </Stack.Navigator>
  );
};
