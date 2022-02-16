import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import {
  DataListSection,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Touchable,
  VolunteerCalendar,
  VolunteerHeaderProfile,
  VolunteerWelcome,
  WrapperRow
} from '../../components';
import { colors, consts, Icon, normalize, texts } from '../../config';
import {
  allGroups,
  myCalendar,
  myGroups,
  myGroupsFollowing,
  myMessages,
  myTasks
} from '../../helpers/parser/volunteer';
import { useVolunteerUser } from '../../hooks/volunteer';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

const { MATOMO_TRACKING, ROOT_ROUTE_NAMES } = consts;

const NAVIGATION = {
  CALENDAR_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: 'Mein Kalender',
      query: QUERY_TYPES.VOLUNTEER.CALENDAR,
      queryVariables: {},
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

type CalendarListToggle = {
  showCalendar: boolean;
  setShowCalendar: (showCalendar: boolean) => void;
};

const CalendarListToggle = ({ showCalendar, setShowCalendar }: CalendarListToggle) => {
  const text = showCalendar ? ` ${texts.volunteer.list}` : ` ${texts.volunteer.calendar}`;
  const CalendarListToggleIcon = showCalendar ? Icon.VolunteerList : Icon.VolunteerCalendar;

  return (
    <Touchable onPress={() => setShowCalendar(!showCalendar)}>
      <WrapperRow style={styles.calendarListToggle}>
        <CalendarListToggleIcon color={colors.darkText} />
        <RegularText>{text}</RegularText>
      </WrapperRow>
    </Touchable>
  );
};

export const VolunteerPersonalScreen = ({ navigation, route }: any) => {
  const [refreshingHome, setRefreshingHome] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { refresh: refreshUser, isLoading, isError, isLoggedIn } = useVolunteerUser();

  const refresh = useCallback(() => {
    refreshUser();
  }, [refreshUser]);

  const refreshHome = () => {
    setRefreshingHome(true);

    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshingHome(false);
    }, 1500);
  };

  // refresh if the refreshUser param changed, which happens after login
  useEffect(refresh, [route.params?.refreshUser]);

  useEffect(
    () =>
      navigation.setOptions({
        headerRight: () =>
          isLoggedIn ? (
            <WrapperRow style={styles.headerRight}>
              <VolunteerHeaderProfile navigation={navigation} style={styles.icon} />
            </WrapperRow>
          ) : null
      }),
    [isLoggedIn, navigation]
  );

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  if (!isLoggedIn || isError) {
    return <VolunteerWelcome navigation={navigation} />;
  }

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
        <SectionHeader
          onPress={() => navigation.navigate(NAVIGATION.CALENDAR_INDEX)}
          title="Mein Kalender"
        />
        <CalendarListToggle showCalendar={showCalendar} setShowCalendar={setShowCalendar} />
        {showCalendar ? (
          <VolunteerCalendar navigation={navigation} />
        ) : (
          <DataListSection
            loading={false}
            navigateLink={() => navigation.navigate(NAVIGATION.CALENDAR_INDEX)}
            navigation={navigation}
            query={QUERY_TYPES.VOLUNTEER.CALENDAR}
            sectionData={myCalendar()}
          />
        )}
        <DataListSection
          linkTitle="Alle Termine anzeigen"
          buttonTitle="Termin eintragen"
          loading={false}
          navigateLink={() => navigation.navigate(NAVIGATION.CALENDAR_INDEX)}
          navigateButton={() => navigation.navigate(NAVIGATION.CALENDAR_NEW)}
          navigate={() => navigation.navigate(NAVIGATION.CALENDAR_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.CALENDAR}
          sectionData={myCalendar()}
          limit={0}
          showLink
          showButton
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
          loading={false}
          navigateLink={() => navigation.navigate(NAVIGATION.MESSAGES_INDEX)}
          navigate={() => navigation.navigate(NAVIGATION.MESSAGES_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.MESSAGES}
          sectionData={myMessages()}
          sectionTitle="Mein Postfach"
          showLink
        />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  calendarListToggle: {
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5)
  },
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(7)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
