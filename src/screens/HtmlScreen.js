import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import {
  EmptyMessage,
  HtmlView,
  MultiButtonWithSubQuery,
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
  const [refreshing, setRefreshing] = useState(false);
  const trackScreenViewAsync = useTrackScreenViewAsync();

  if (!query || !queryVariables?.name) return <EmptyMessage title={texts.empty.content} />;

  const { data, loading, refetch } = useStaticContent({
    name: queryVariables.name,
    type: 'html',
    refreshTimeKey: `${query}-${queryVariables.name}`
  });

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `title` dependency
  useEffect(() => {
    isConnected && title && trackScreenViewAsync(`${MATOMO_TRACKING.SCREEN_VIEW.HTML} / ${title}`);
  }, [title]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    isConnected && (await refetch?.());
    setRefreshing(false);
  }, [isConnected, refetch]);

  const subQuery = route.params?.subQuery ?? '';
  const rootRouteName = route.params?.rootRouteName ?? '';

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!data) return null;

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
          <HtmlView
            html={trimNewLines(data)}
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
