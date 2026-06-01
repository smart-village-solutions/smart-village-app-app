import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import {
  EmptyMessage,
  HtmlView,
  MultiButtonWithSubQuery,
  ReadAloudContent,
  navigateWithSubQuery,
  SafeAreaViewFlex,
  Wrapper
} from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors, consts, texts } from '../config';
import { trimNewLines } from '../helpers';
import { useStaticContent, useTrackScreenViewAsync } from '../hooks';
import { NetworkContext } from '../NetworkProvider';

const { MATOMO_TRACKING } = consts;

// eslint-disable-next-line complexity
export const HtmlScreen = ({ navigation, route }) => {
  const { isConnected } = useContext(NetworkContext);
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const title = route.params?.title ?? '';
  const isMissingQuery = !query || !queryVariables?.name;
  const [refreshing, setRefreshing] = useState(false);
  const trackScreenViewAsync = useTrackScreenViewAsync();

  const { data, loading, refetch } = useStaticContent({
    name: queryVariables?.name || '',
    type: 'html',
    refreshTimeKey: `${query}-${queryVariables?.name || ''}`,
    skip: isMissingQuery
  });

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `title` dependency
  useEffect(() => {
    isConnected && title && trackScreenViewAsync(`${MATOMO_TRACKING.SCREEN_VIEW.HTML} / ${title}`);
  }, [isConnected, title, trackScreenViewAsync]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    isConnected && (await refetch?.());
    setRefreshing(false);
  }, [isConnected, refetch]);

  const subQuery = route.params?.subQuery ?? {};
  const rootRouteName = route.params?.rootRouteName ?? '';
  const htmlContent = data || '';

  if (isMissingQuery) return <EmptyMessage title={texts.empty.content} />;

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (data === null || data === undefined) return null;

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
        <Wrapper>
          <ReadAloudContent content={htmlContent} contentId="html-screen-content" />
          <HtmlView
            html={trimNewLines(htmlContent)}
            openWebScreen={
              navigation
                ? (param) => navigateWithSubQuery({ params: param, navigation, subQuery })
                : undefined
            }
            navigation={navigation}
          />
          <MultiButtonWithSubQuery {...{ navigation, rootRouteName, subQuery, title }} />
        </Wrapper>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

HtmlScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
