import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import { useProfileContext } from '../../ProfileProvider';
import {
  EmptyMessage,
  HeadlineText,
  Image,
  MultiButtonWithSubQuery,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { colors, consts, normalize, texts } from '../../config';
import { profileAuthToken } from '../../helpers';
import { useStaticContent, useTrackScreenViewAsync } from '../../hooks';
import { ScreenName } from '../../types';

import { ProfileScreen } from './ProfileScreen';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
export const ProfileHomeScreen = ({ navigation, route }: StackScreenProps<any, string>) => {
  const { refresh, isLoading, isLoggedIn } = useProfileContext();
  const { isConnected } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);
  const [isProfileLoggedIn, setIsProfileLoggedIn] = useState(isLoggedIn);
  const trackScreenViewAsync = useTrackScreenViewAsync();
  const { query, queryVariables = {}, rootRouteName, title: screenTitle } = route.params || {};

  const { data, loading, refetch } = useStaticContent({
    name: queryVariables.name,
    type: 'json',
    refreshTimeKey: `${query}-${queryVariables.name}`
  });

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `title` dependency
  useEffect(() => {
    isConnected &&
      screenTitle &&
      trackScreenViewAsync(`${MATOMO_TRACKING.SCREEN_VIEW.HTML} / ${screenTitle}`);
  }, [screenTitle]);

  const refreshUser = useCallback(() => {
    refresh();
  }, [refresh]);

  // refresh if the refreshUser param changed, which happens after login
  useEffect(refreshUser, [route.params?.refreshUser]);

  const refreshHome = useCallback(async () => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  }, [isConnected, refetch]);

  useFocusEffect(
    useCallback(() => {
      const getLoginStatus = async () => {
        const storedProfileAuthToken = await profileAuthToken();

        setIsProfileLoggedIn(!!storedProfileAuthToken);
      };

      getLoginStatus();
    }, [route.params?.refreshUser])
  );

  if (!query || !queryVariables?.name) return <EmptyMessage title={texts.empty.content} />;

  if (loading || isLoading) {
    return <LoadingSpinner loading />;
  }

  if (isProfileLoggedIn || isLoggedIn) {
    return <ProfileScreen navigation={navigation} route={route} />;
  }

  if (!data) {
    return (
      <SafeAreaViewFlex>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshHome}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
        >
          <EmptyMessage title={texts.empty.content} />
        </ScrollView>
      </SafeAreaViewFlex>
    );
  }

  const { description, headline, picture, subQuery, title, webUrl } = data;

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshHome}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        {!!picture && (
          <Image
            source={picture}
            aspectRatio={picture.aspectRatio || { HEIGHT: 0.7, WIDTH: 1 }}
            resizeMode="cover"
          />
        )}

        <Wrapper style={styles.smallPaddingBottom}>
          <WrapperHorizontal>
            {!!headline && (
              <HeadlineText center uppercase style={styles.headlineText}>
                {headline}
              </HeadlineText>
            )}
          </WrapperHorizontal>
        </Wrapper>

        <Wrapper noPaddingTop>
          <WrapperHorizontal>
            {!!title && (
              <HeadlineText center big>
                {title}
              </HeadlineText>
            )}
          </WrapperHorizontal>
        </Wrapper>

        <Wrapper noPaddingTop>
          <WrapperHorizontal>
            {!!description && <RegularText center>{description}</RegularText>}
          </WrapperHorizontal>
        </Wrapper>

        <Wrapper style={styles.smallPaddingBottom}>
          <MultiButtonWithSubQuery {...{ navigation, rootRouteName, subQuery, title }} />
        </Wrapper>

        <Wrapper noPaddingTop>
          <WrapperHorizontal>
            <RegularText center>
              {texts.profile.alreadyRegistered}
              <RegularText
                underline
                onPress={() => navigation.navigate(ScreenName.ProfileLogin, { webUrl })}
              >
                {texts.profile.login}
              </RegularText>
            </RegularText>
          </WrapperHorizontal>
        </Wrapper>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  headlineText: {
    fontSize: normalize(14),
    fontWeight: '700',
    lineHeight: normalize(16)
  },
  smallPaddingBottom: {
    paddingBottom: normalize(8)
  }
});
