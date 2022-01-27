import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { DataListSection, SafeAreaViewFlex } from '../../components';
import { colors, consts } from '../../config';
import {
  allGroups,
  myCalendar,
  myGroups,
  myGroupsFollowing,
  myMessages,
  myTasks
} from '../../helpers/parser/volunteer';
import { useMatomoTrackScreenView } from '../../hooks';
import { QUERY_TYPES } from '../../queries';

const { MATOMO_TRACKING, ROOT_ROUTE_NAMES } = consts;

const NAVIGATION = {
  CALENDAR_INDEX: {
    name: 'VolunteerIndex',
    params: {
      title: 'Mein Kalender',
      query: QUERY_TYPES.VOLUNTEER.CALENDAR,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  GROUPS_INDEX: {
    name: 'VolunteerIndex',
    params: {
      title: 'Meine Gruppen',
      query: QUERY_TYPES.VOLUNTEER.GROUPS,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  GROUPS_FOLLOWING_INDEX: {
    name: 'VolunteerIndex',
    params: {
      title: 'Gruppen, denen ich folge',
      query: QUERY_TYPES.VOLUNTEER.GROUPS_FOLLOWING,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  ALL_GROUPS_INDEX: {
    name: 'VolunteerIndex',
    params: {
      title: 'Alle Gruppen',
      query: QUERY_TYPES.VOLUNTEER.ALL_GROUPS,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  MESSAGES_INDEX: {
    name: 'VolunteerIndex',
    params: {
      title: 'Mein Postfach',
      query: QUERY_TYPES.VOLUNTEER.MESSAGES,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  TASKS_INDEX: {
    name: 'VolunteerIndex',
    params: {
      title: 'Meine Aufgaben',
      query: QUERY_TYPES.VOLUNTEER.TASKS,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
};

export const VolunteerScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  // useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.MORE);

  const refresh = () => {
    setRefreshing(true);

    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
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
          buttonTitle="Alle Gruppen anzeigen"
          loading={false}
          navigate={() => navigation.navigate(NAVIGATION.ALL_GROUPS_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.ALL_GROUPS}
          sectionData={allGroups()}
          limit={0}
          showButton
        />
        <DataListSection
          buttonTitle="Alle Termine anzeigen"
          loading={false}
          navigate={() => navigation.navigate(NAVIGATION.CALENDAR_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.CALENDAR}
          sectionData={myCalendar()}
          sectionTitle="Mein Kalender"
          showButton
        />
        <DataListSection
          buttonTitle="Alle Aufgaben anzeigen"
          loading={false}
          navigate={() => navigation.navigate(NAVIGATION.TASKS_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.TASKS}
          sectionData={myTasks()}
          sectionTitle="Meine Aufgaben"
          showButton
        />
        <DataListSection
          buttonTitle="Alle Nachrichten anzeigen"
          loading={false}
          navigate={() => navigation.navigate(NAVIGATION.MESSAGES_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.MESSAGES}
          sectionData={myMessages()}
          sectionTitle="Mein Postfach"
          showButton
        />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

VolunteerScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
