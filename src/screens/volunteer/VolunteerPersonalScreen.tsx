import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect } from 'react';
import { DeviceEventEmitter, RefreshControl, ScrollView } from 'react-native';

import { LoadingSpinner, SafeAreaViewFlex, ServiceTiles } from '../../components';
import { colors } from '../../config';
import { useStaticContent, useVolunteerUser, VOLUNTEER_PERSONAL_REFRESH_EVENT } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

export const VolunteerPersonalScreen = ({ navigation }: StackScreenProps<any>) => {
  const { isLoading, isLoggedIn } = useVolunteerUser();
  const {
    data: dataPersonalText,
    loading: loadingPersonalText,
    refetch: refetchPersonalText
  } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-volunteerPersonalText',
    name: 'volunteerPersonalText',
    type: 'html'
  });

  const refreshPersonal = useCallback(() => {
    refetchPersonalText();

    // this will trigger the onRefresh functions provided to the `useVolunteerRefresh` hook
    // in other components.
    DeviceEventEmitter.emit(VOLUNTEER_PERSONAL_REFRESH_EVENT);
  }, []);

  useFocusEffect(refreshPersonal);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigation.replace(ScreenName.VolunteerLogin);
    }
  }, [isLoading, isLoggedIn]);

  if (loadingPersonalText) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refreshPersonal}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        <ServiceTiles
          html={dataPersonalText}
          query={QUERY_TYPES.VOLUNTEER.PERSONAL}
          staticJsonName="volunteerPersonalTiles"
        />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
