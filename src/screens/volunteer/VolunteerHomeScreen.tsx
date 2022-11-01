import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { DeviceEventEmitter } from 'expo-modules-core';
import React, { useCallback, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import {
  Button,
  ImagesCarousel,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  ServiceTiles,
  VolunteerWelcome,
  Wrapper
} from '../../components';
import { colors } from '../../config';
import { useStaticContent, useVolunteerUser, VOLUNTEER_HOME_REFRESH_EVENT } from '../../hooks';
import { ScreenName } from '../../types';

// eslint-disable-next-line complexity
export const VolunteerHomeScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { refresh, isLoading, isError, isLoggedIn } = useVolunteerUser();
  const {
    data: dataImageCarousel,
    loading: loadingImageCarousel,
    refetch: refetchImageCarousel
  } = useStaticContent({
    refreshTimeKey: `publicJsonFile-volunteerCarousel${isLoggedIn ? '-loggedIn' : ''}`,
    name: `volunteerCarousel${isLoggedIn ? '-loggedIn' : ''}`,
    type: 'json'
  });
  const {
    data: dataHomeText,
    loading: loadingHomeText,
    refetch: refetchHomeText
  } = useStaticContent({
    refreshTimeKey: `publicJsonFile-volunteerHomeText${isLoggedIn ? '-loggedIn' : ''}`,
    name: `volunteerHomeText${isLoggedIn ? '-loggedIn' : ''}`,
    type: 'html'
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

  if (isLoading || loadingImageCarousel || loadingHomeText) {
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
              refetchImageCarousel();
              refetchHomeText();
            }}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <ImagesCarousel data={dataImageCarousel} />

        <ServiceTiles
          html={dataHomeText}
          navigation={navigation}
          staticJsonName={`volunteerHomeTiles${isLoggedIn ? '-loggedIn' : ''}`}
        />

        {!isLoggedIn && (
          <Wrapper style={styles.buttonWrapper}>
            <Wrapper>
              <Button
                title="Zum Login"
                onPress={() => navigation.navigate(ScreenName.VolunteerLogin)}
                notFullWidth
              />
              <TouchableOpacity
                onPress={() => navigation.navigate(ScreenName.VolunteerRegistration)}
              >
                <RegularText primary center>
                  Noch keinen Account? Jetzt registrieren.
                </RegularText>
              </TouchableOpacity>
            </Wrapper>
          </Wrapper>
        )}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    backgroundColor: colors.lighterPrimaryRgba
  }
});
