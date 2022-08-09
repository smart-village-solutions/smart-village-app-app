import { useFocusEffect } from '@react-navigation/native';
import { DeviceEventEmitter } from 'expo-modules-core';
import React, { useCallback, useEffect } from 'react';
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
import { additionalData } from '../../helpers/parser/volunteer';
import { useStaticContent, useVolunteerUser, VOLUNTEER_HOME_REFRESH_EVENT } from '../../hooks';
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
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  GROUPS_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: texts.volunteer.groups,
      query: QUERY_TYPES.VOLUNTEER.GROUPS,
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  GROUP_NEW: {
    name: ScreenName.VolunteerForm,
    params: {
      title: 'Gruppe/Verein erstellen',
      query: QUERY_TYPES.VOLUNTEER.GROUP,
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  ADDITIONAL_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: 'Ganz praktisch',
      query: QUERY_TYPES.VOLUNTEER.ADDITIONAL,
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
};

export const VolunteerHomeScreen = ({ navigation, route }: any) => {
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
    // this will trigger the onRefresh functions provided to the `useVolunteerRefresh` hook
    // in other components.
    DeviceEventEmitter.emit(VOLUNTEER_HOME_REFRESH_EVENT);
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
            refreshing={false}
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
        <VolunteerHomeSection
          linkTitle="Alle Gruppen und Vereine anzeigen"
          buttonTitle="Gruppe/Verein erstellen"
          navigateLink={() => navigation.navigate(NAVIGATION.GROUPS_INDEX)}
          navigateButton={() => navigation.navigate(NAVIGATION.GROUP_NEW)}
          navigate={() => navigation.navigate(NAVIGATION.GROUPS_INDEX)}
          navigation={navigation}
          query={QUERY_TYPES.VOLUNTEER.GROUPS}
          sectionTitle="Gruppen und Vereine"
          showLink
          showButton
          isRandom
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
