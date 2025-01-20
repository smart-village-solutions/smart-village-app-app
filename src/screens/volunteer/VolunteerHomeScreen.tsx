import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect } from 'react';
import {
  DeviceEventEmitter,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import {
  Button,
  ImagesCarousel,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  ServiceTiles,
  Wrapper
} from '../../components';
import { colors } from '../../config';
import { useStaticContent, useVolunteerUser, VOLUNTEER_HOME_REFRESH_EVENT } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

// eslint-disable-next-line complexity
export const VolunteerHomeScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { refresh, isLoading, isLoggedIn } = useVolunteerUser();
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
    refetchImageCarousel();
    refetchHomeText();

    // this will trigger the onRefresh functions provided to the `useVolunteerRefresh` hook
    // in other components.
    DeviceEventEmitter.emit(VOLUNTEER_HOME_REFRESH_EVENT);
  }, []);

  useFocusEffect(refreshHome);

  if (isLoading || loadingImageCarousel || loadingHomeText) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refreshHome}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        <ImagesCarousel data={dataImageCarousel} />

        <ServiceTiles
          html={dataHomeText}
          query={QUERY_TYPES.VOLUNTEER.HOME}
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
