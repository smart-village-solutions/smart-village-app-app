import { useFocusEffect } from '@react-navigation/native';
import { DeviceEventEmitter } from 'expo-modules-core';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import {
  DataListSection,
  SafeAreaViewFlex,
  VolunteerHeaderProfile,
  VolunteerHomeSection,
  WrapperRow
} from '../../components';
import { colors, consts, normalize, texts } from '../../config';
import {
  allGroups,
  myGroups,
  myGroupsFollowing,
  myMessages,
  myTasks
} from '../../helpers/parser/volunteer';
import { SVA_VOLUNTEER_PERSONAL_REFRESH } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

const { ROOT_ROUTE_NAMES } = consts;

const NAVIGATION = {
  CALENDAR_MY_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: texts.volunteer.myCalendar,
      query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY,
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  CALENDAR_NEW: {
    name: ScreenName.VolunteerForm,
    params: {
      title: 'Termin eintragen',
      query: QUERY_TYPES.VOLUNTEER.CALENDAR,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  GROUPS_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: 'Meine Gruppen',
      query: QUERY_TYPES.VOLUNTEER.GROUPS,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  GROUPS_FOLLOWING_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: 'Gruppen, denen ich folge',
      query: QUERY_TYPES.VOLUNTEER.GROUPS_FOLLOWING,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  ALL_GROUPS_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: 'Alle Gruppen',
      query: QUERY_TYPES.VOLUNTEER.ALL_GROUPS,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  MESSAGES_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: 'Mein Postfach',
      query: QUERY_TYPES.VOLUNTEER.MESSAGES,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  MESSAGE_NEW: {
    name: ScreenName.VolunteerForm,
    params: {
      title: 'Neue Nachricht',
      query: QUERY_TYPES.VOLUNTEER.MESSAGES,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  TASKS_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: 'Meine Aufgaben',
      query: QUERY_TYPES.VOLUNTEER.TASKS,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
};

export const VolunteerPersonalScreen = ({ navigation }: any) => {
  const [refreshingHome, setRefreshingHome] = useState(false);

  const refreshHome = useCallback(() => {
    setRefreshingHome(true);

    // this will trigger the onRefresh functions provided to the `useVolunteerHomeRefresh` hook
    // in other components.
    DeviceEventEmitter.emit(SVA_VOLUNTEER_PERSONAL_REFRESH);

    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshingHome(false);
    }, 500);
  }, []);

  useFocusEffect(refreshHome);

  useEffect(
    () =>
      navigation.setOptions({
        headerRight: () => (
          <WrapperRow style={styles.headerRight}>
            <VolunteerHeaderProfile navigation={navigation} style={styles.icon} />
          </WrapperRow>
        )
      }),
    [navigation]
  );

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshingHome}
            onRefresh={refreshHome}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <DataListSection
          loading={false}
          navigate={() => navigation.navigate(NAVIGATION.GROUPS_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.GROUPS}
          sectionData={myGroups()}
          sectionTitle="Meine Gruppen"
        />
        <DataListSection
          loading={false}
          navigate={() => navigation.navigate(NAVIGATION.GROUPS_FOLLOWING_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.GROUPS_FOLLOWING}
          sectionData={myGroupsFollowing()}
          sectionTitle="Gruppen, denen ich folge"
        />
        <DataListSection
          linkTitle="Alle Gruppen anzeigen"
          loading={false}
          navigateLink={() => navigation.navigate(NAVIGATION.ALL_GROUPS_INDEX)}
          navigate={() => navigation.navigate(NAVIGATION.ALL_GROUPS_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.ALL_GROUPS}
          sectionData={allGroups()}
          limit={0}
          showLink
        />
        <VolunteerHomeSection
          linkTitle="Alle meine Termine anzeigen"
          buttonTitle="Termin eintragen"
          navigateLink={() => navigation.navigate(NAVIGATION.CALENDAR_MY_INDEX)}
          navigateButton={() => navigation.navigate(NAVIGATION.CALENDAR_NEW)}
          navigate={() => navigation.navigate(NAVIGATION.CALENDAR_MY_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY}
          sectionTitle="Mein Kalender"
        />
        <DataListSection
          linkTitle="Alle Aufgaben anzeigen"
          loading={false}
          navigateLink={() => navigation.navigate(NAVIGATION.TASKS_INDEX)}
          navigate={() => navigation.navigate(NAVIGATION.TASKS_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.TASKS}
          sectionData={myTasks()}
          sectionTitle="Meine Aufgaben"
          showLink
        />
        <DataListSection
          linkTitle="Alle Nachrichten anzeigen"
          buttonTitle="Neue Nachricht"
          loading={false}
          navigateLink={() => navigation.navigate(NAVIGATION.MESSAGES_INDEX)}
          navigateButton={() => navigation.navigate(NAVIGATION.MESSAGE_NEW)}
          navigate={() => navigation.navigate(NAVIGATION.MESSAGES_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.MESSAGES}
          sectionData={myMessages()}
          sectionTitle="Mein Postfach"
          showLink
          showButton
        />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(7)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
