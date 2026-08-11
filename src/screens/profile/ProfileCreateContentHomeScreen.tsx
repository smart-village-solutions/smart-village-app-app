import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import {
  LoadingSpinner,
  SafeAreaViewFlex,
  SectionHeader,
  Service,
  WrapperVertical
} from '../../components';
import { colors, normalize, texts } from '../../config';
import { profileAuthToken } from '../../helpers';
import { hasEditorialRoles } from '../../helpers/profileEditorialContentHelper';
import { useStaticContent } from '../../hooks/staticContent';
import { NetworkContext } from '../../NetworkProvider';
import { useProfileContext } from '../../ProfileProvider';

import { ProfileHomeScreen } from './ProfileHomeScreen';

export const ProfileCreateContentHomeScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { currentUserData, refresh, isLoggedIn } = useProfileContext();
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

  const hasEditorialAccess = hasEditorialRoles(currentUserData?.roles);

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
      >
        {!!topTiles?.length && (
          <WrapperVertical noPaddingBottom>
            <SectionHeader title={texts.profile.createContentNoticeboard} />
            <Service
              alignIncompleteRowsLeft
              data={topTiles}
              rowHorizontalPadding={normalize(8)}
              staticJsonName="profileCreateContentServiceTop"
              tileLayoutColumns={{ portrait: 2.7 }}
            />
          </WrapperVertical>
        )}

        {!!bottomTiles?.length && hasEditorialAccess && (
          <WrapperVertical noPaddingTop>
            <SectionHeader title={texts.profile.createContentEditorial} />
            <Service
              alignIncompleteRowsLeft
              data={bottomTiles}
              rowHorizontalPadding={normalize(8)}
              staticJsonName="profileCreateContentServiceBottom"
              tileLayoutColumns={{ portrait: 2.7 }}
            />
          </WrapperVertical>
        )}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
