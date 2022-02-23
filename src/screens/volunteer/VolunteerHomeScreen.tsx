import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import {
  DataListSection,
  ImagesCarousel,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Touchable,
  VolunteerCalendar,
  VolunteerHeaderPersonal,
  VolunteerHomeSection,
  VolunteerWelcome,
  WrapperRow
} from '../../components';
import { colors, consts, Icon, normalize, texts } from '../../config';
import { additionalData, allGroups } from '../../helpers/parser/volunteer';
import { useStaticContent, useVolunteerUser } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

const { ROOT_ROUTE_NAMES } = consts;

const NAVIGATION = {
  CALENDAR_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: texts.volunteer.calendar,
      query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
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
  ADDITIONAL_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: 'Ganz praktisch',
      query: QUERY_TYPES.VOLUNTEER.ADDITIONAL,
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

export const VolunteerHomeScreen = ({ navigation, route }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const { refresh, isLoading, isError, isLoggedIn } = useVolunteerUser();
  const { data, loading, refetch } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-volunteerCarousel',
    name: 'volunteerCarousel',
    type: 'json'
  });

  const refreshUser = useCallback(() => {
    refresh();
  }, [refresh]);

  const refreshHome = useCallback(async () => {
    setRefreshing(true);
    await refetch?.();
    setRefreshing(false);
  }, [refetch]);

  // refresh if the refreshUser param changed, which happens after login
  useEffect(refreshUser, [route.params?.refreshUser]);

  useEffect(
    () =>
      navigation.setOptions({
        headerRight: () =>
          isLoggedIn ? (
            <WrapperRow style={styles.headerRight}>
              <VolunteerHeaderPersonal navigation={navigation} style={styles.icon} />
            </WrapperRow>
          ) : null
      }),
    [isLoggedIn, navigation]
  );

  if (isLoading || loading) {
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
            refreshing={refreshing}
            onRefresh={refreshHome}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <ImagesCarousel data={data} />
        {/* TODO: do we want widgets on volunteer home screen? */}
        {/* <Widgets widgetConfigs={volunteerWidgetConfigs} /> */}
        <SectionHeader
          onPress={() => navigation.navigate(NAVIGATION.CALENDAR_INDEX)}
          title="Kalender"
        />
        <CalendarListToggle showCalendar={showCalendar} setShowCalendar={setShowCalendar} />
        {showCalendar ? (
          <VolunteerCalendar query={QUERY_TYPES.VOLUNTEER.CALENDAR_ALL} navigation={navigation} />
        ) : (
          <VolunteerHomeSection
            navigateLink={() => navigation.navigate(NAVIGATION.CALENDAR_INDEX)}
            navigation={navigation}
            query={QUERY_TYPES.VOLUNTEER.CALENDAR_ALL}
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
          query={QUERY_TYPES.VOLUNTEER.CALENDAR_ALL}
          limit={0}
          showLink
          showButton
        />
        <DataListSection
          linkTitle="Alle Gruppen anzeigen"
          buttonTitle="Gruppe eintragen"
          loading={false}
          navigateLink={() => navigation.navigate(NAVIGATION.ALL_GROUPS_INDEX)}
          navigateButton={() => undefined}
          navigate={() => navigation.navigate(NAVIGATION.ALL_GROUPS_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.ALL_GROUPS}
          sectionData={allGroups()}
          sectionTitle="Gruppen"
          showLink
          showButton
        />
        <DataListSection
          loading={false}
          navigate={() => navigation.navigate(NAVIGATION.ADDITIONAL_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.ADDITIONAL}
          sectionData={additionalData()}
          sectionTitle="Ganz praktisch"
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
