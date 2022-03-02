import { useFocusEffect } from '@react-navigation/native';
import { DeviceEventEmitter } from 'expo-modules-core';
import React, { useCallback, useEffect } from 'react';
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
      title: texts.volunteer.calendarMy,
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
  GROUPS_MY_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: texts.volunteer.groupsMy,
      query: QUERY_TYPES.VOLUNTEER.GROUPS_MY,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  GROUP_NEW: {
    name: ScreenName.VolunteerForm,
    params: {
      title: 'Gruppe erstellen',
      query: QUERY_TYPES.VOLUNTEER.GROUP,
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
  const refreshHome = useCallback(() => {
    // this will trigger the onRefresh functions provided to the `useVolunteerHomeRefresh` hook
    // in other components.
    DeviceEventEmitter.emit(SVA_VOLUNTEER_PERSONAL_REFRESH);
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
            refreshing={false}
            onRefresh={refreshHome}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <VolunteerHomeSection
          linkTitle="Alle meine Gruppen anzeigen"
          buttonTitle="Gruppe erstellen"
          navigateLink={() => navigation.navigate(NAVIGATION.GROUPS_MY_INDEX)}
          navigateButton={() => navigation.navigate(NAVIGATION.GROUP_NEW)}
          navigate={() => navigation.navigate(NAVIGATION.GROUPS_MY_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.GROUPS_MY}
          sectionTitle="Meine Gruppen"
          showLink
          showButton
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
