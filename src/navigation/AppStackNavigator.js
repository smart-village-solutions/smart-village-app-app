import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

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
} from '../screens';
import {
  DetailScreen as BBBUSDetailScreen,
  IndexScreen as BBBUSIndexScreen
} from '../screens/BB-BUS';

import { defaultStackNavigatorScreenOptions } from './defaultStackNavigatorConfig';
import { colors, normalize, texts } from '../config';
import { Icon, WrapperRow } from '../components';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { favSettings } from '../icons';
import { StyleSheet } from 'react-native';

const Stack = createStackNavigator();

export const AppStackNavigator = (headerRight = true) => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      // screenOptions={{headerLeft: }
      screenOptions={defaultStackNavigatorScreenOptions(headerRight)}
    >
      <Stack.Screen name="BBBUSIndex" component={BBBUSIndexScreen} />
      <Stack.Screen name="BBBUSDetail" component={BBBUSDetailScreen} />
      <Stack.Screen name="Bookmarks" component={BookmarkScreen} />
      <Stack.Screen name="BookmarkCategory" component={BookmarkCategoryScreen} />
      <Stack.Screen name="ConstructionSiteDetail" component={ConstructionSiteDetailScreen} />
      <Stack.Screen name="ConstructionSiteOverview" component={ConstructionSiteOverviewScreen} />
      <Stack.Screen name="DataProvider" component={DataProviderScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Form" component={FormScreen} />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation, route }) => ({
          headerLeft: () => (
            <WrapperRow>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Bookmarks', { title: texts.bookmarks.bookmarks })
                }
                accessibilityLabel="Einstellungen und Lesezeichen (Taste)"
                accessibilityHint="Zu den Einstellungen und Lesezeichen wechseln"
              >
                <Icon
                  style={headerRight ? styles.iconLeft : styles.iconRight}
                  xml={favSettings(colors.lightestText)}
                />
              </TouchableOpacity>
            </WrapperRow>
          ),
          title: route.params?.title?.length ?? texts.screenTitles.home
        })}
      />
      <Stack.Screen name="Html" component={HtmlScreen} />
      <Stack.Screen name="Index" component={IndexScreen} />
      <Stack.Screen name="Lunch" component={LunchScreen} />
      <Stack.Screen name="OParlCalendar" component={OParlCalendarScreen} />
      <Stack.Screen name="OParlDetail" component={OParlDetailScreen} />
      <Stack.Screen name="OParlOrganizations" component={OParlOrganizationsScreen} />
      <Stack.Screen name="OParlOverview" component={OParlOverviewScreen} />
      <Stack.Screen name="OParlPersons" component={OParlPersonsScreen} />
      <Stack.Screen name="OParlSearch" component={OParlSearchScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="WasteCollection" component={WasteCollectionScreen} />
      <Stack.Screen name="WasteReminder" component={WasteReminderScreen} />
      <Stack.Screen name="Weather" component={WeatherScreen} />
      <Stack.Screen name="Web" component={WebScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  iconLeft: {
    paddingLeft: normalize(14),
    paddingRight: normalize(7),
    paddingVertical: normalize(4)
  }
});
