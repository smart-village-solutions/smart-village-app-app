import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

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
import { useStaticContent, useTrackScreenViewAsync } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { ScreenName } from '../../types';

const { MATOMO_TRACKING } = consts;

export const ProfileHomeScreen = ({ navigation, route }: StackScreenProps<any, string>) => {
  const { isConnected } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);
  const trackScreenViewAsync = useTrackScreenViewAsync();
  const { query, queryVariables = {}, rootRouteName, title: screenTitle } = route.params || {};

  if (!query || !queryVariables?.name) return <EmptyMessage title={texts.empty.content} />;

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

  const refresh = useCallback(async () => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  }, [isConnected, refetch]);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!data) return null;

  const { description, headline, picture, subQuery, title } = data;

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
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

        <Wrapper style={styles.noPaddingTop}>
          <WrapperHorizontal>
            {!!title && (
              <HeadlineText center big>
                {title}
              </HeadlineText>
            )}
          </WrapperHorizontal>
        </Wrapper>

        <Wrapper style={styles.noPaddingTop}>
          <WrapperHorizontal>
            {!!description && <RegularText center>{description}</RegularText>}
          </WrapperHorizontal>
        </Wrapper>

        <Wrapper style={styles.smallPaddingBottom}>
          <MultiButtonWithSubQuery {...{ navigation, rootRouteName, subQuery, title }} />
        </Wrapper>

        <Wrapper style={styles.noPaddingTop}>
          <WrapperHorizontal>
            <RegularText center>
              Sind Sie schon registriert?{' '}
              <RegularText underline onPress={() => navigation.navigate(ScreenName.ProfileLogin)}>
                Einloggen
              </RegularText>
            </RegularText>
          </WrapperHorizontal>
        </Wrapper>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  headlineText: {
    fontSize: normalize(14),
    fontWeight: '700',
    lineHeight: normalize(16)
  },
  smallPaddingBottom: {
    paddingBottom: normalize(8)
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
