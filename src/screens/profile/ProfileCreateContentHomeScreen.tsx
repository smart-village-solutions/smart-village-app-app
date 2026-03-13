import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { LoadingSpinner, SafeAreaViewFlex, Service } from '../../components';
import { colors, normalize } from '../../config';
import { profileAuthToken } from '../../helpers';
import { useStaticContent } from '../../hooks/staticContent';
import { NetworkContext } from '../../NetworkProvider';
import { useProfileContext } from '../../ProfileProvider';

import { ProfileHomeScreen } from './ProfileHomeScreen';

export const ProfileCreateContentHomeScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { refresh, isLoggedIn } = useProfileContext();
  const { isConnected } = useContext(NetworkContext);

  const [isProfileLoggedIn, setIsProfileLoggedIn] = useState(isLoggedIn);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: topTiles,
    loading: loadingTopTiles,
    refetch: refetchTopTiles
  } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-profileCreateContentServiceTop',
    name: 'profileCreateContentServiceTop',
    type: 'json'
  });

  const {
    data: bottomTiles,
    loading: loadingBottomTiles,
    refetch: refetchBottomTiles
  } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-profileCreateContentServiceBottom',
    name: 'profileCreateContentServiceBottom',
    type: 'json'
  });

  const refreshUser = useCallback(() => {
    refresh();
  }, [refresh]);

  const refreshContent = useCallback(async () => {
    setRefreshing(true);
    isConnected && (await refetchTopTiles?.());
    isConnected && (await refetchBottomTiles?.());
    setRefreshing(false);
  }, [isConnected, refetchBottomTiles, refetchTopTiles]);

  // refresh if the refreshUser param changed, which happens after login
  useEffect(refreshUser, [route.params?.refreshUser]);

  useFocusEffect(
    useCallback(() => {
      const getLoginStatus = async () => {
        const storedProfileAuthToken = await profileAuthToken();

        setIsProfileLoggedIn(!!storedProfileAuthToken);
      };

      getLoginStatus();
    }, [route.params?.refreshUser])
  );

  if (!isProfileLoggedIn || !isLoggedIn) {
    return <ProfileHomeScreen navigation={navigation} route={route} />;
  }

  if (loadingTopTiles || loadingBottomTiles) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshContent}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
        contentContainerStyle={styles.contentContainer}
      >
        <Service data={topTiles} staticJsonName="profileCreateContentServiceTop" />
        <Service data={bottomTiles} staticJsonName="profileCreateContentServiceBottom" />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: normalize(14)
  }
});
