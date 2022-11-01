import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { DeviceEventEmitter } from 'expo-modules-core';
import React, { useCallback } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { LoadingSpinner, SafeAreaViewFlex, ServiceTiles } from '../../components';
import { colors } from '../../config';
import { useStaticContent, VOLUNTEER_PERSONAL_REFRESH_EVENT } from '../../hooks';
import { QUERY_TYPES } from '../../queries';

export const VolunteerPersonalScreen = ({ navigation }: StackScreenProps<any>) => {
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
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <ServiceTiles
          html={dataPersonalText}
          query={QUERY_TYPES.VOLUNTEER.PERSONAL}
          navigation={navigation}
          staticJsonName="volunteerPersonalTiles"
        />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
