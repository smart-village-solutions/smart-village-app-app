import { useFocusEffect } from '@react-navigation/native';
import { DeviceEventEmitter } from 'expo-modules-core';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import {
  DataListSection,
  ImagesCarousel,
  LoadingSpinner,
  SafeAreaViewFlex,
  VolunteerHeaderPersonal,
  VolunteerHomeSection,
  VolunteerWelcome,
  WrapperRow
} from '../../components';
import { colors, consts, normalize, texts } from '../../config';
import { additionalData, allGroups } from '../../helpers/parser/volunteer';
import { useStaticContent, useVolunteerUser, VOLUNTEER_HOME_REFRESH_EVENT } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

const { ROOT_ROUTE_NAMES } = consts;

export const NAVIGATION = {
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

export const VolunteerHomeScreen = ({ navigation, route }: any) => {
  const [refreshingHome, setRefreshingHome] = useState(false);
  const { refresh, isLoading, isError, isLoggedIn } = useVolunteerUser();
  const { data, loading, refetch: refetchCarousel } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-volunteerCarousel',
    name: 'volunteerCarousel',
    type: 'json'
  });

  const refreshUser = useCallback(() => {
    refresh();
  }, [refresh]);

  // refresh if the refreshUser param changed, which happens after login
  useEffect(refreshUser, [route.params?.refreshUser]);

  const refreshHome = useCallback(() => {
    setRefreshingHome(true);

    // this will trigger the onRefresh functions provided to the `useVolunteerHomeRefresh` hook
    // in other components.
    DeviceEventEmitter.emit(VOLUNTEER_HOME_REFRESH_EVENT);

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
            refreshing={refreshingHome}
            onRefresh={() => {
              refreshHome();
              refetchCarousel();
            }}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <ImagesCarousel data={data} />
        {/* TODO: do we want widgets on volunteer home screen? */}
        {/* <Widgets widgetConfigs={volunteerWidgetConfigs} /> */}
        <VolunteerHomeSection
          linkTitle="Alle Termine anzeigen"
          buttonTitle="Termin eintragen"
          navigateLink={() => navigation.navigate(NAVIGATION.CALENDAR_INDEX)}
          navigateButton={() => navigation.navigate(NAVIGATION.CALENDAR_NEW)}
          navigate={() => navigation.navigate(NAVIGATION.CALENDAR_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.CALENDAR_ALL}
          sectionTitle="Kalender"
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
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(7)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
