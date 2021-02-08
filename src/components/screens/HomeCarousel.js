import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ActivityIndicator } from 'react-native';
import { useQuery } from 'react-apollo';
import _shuffle from 'lodash/shuffle';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import { colors } from '../../config';
import { ImagesCarousel } from '../ImagesCarousel';
import { LoadingContainer } from '../LoadingContainer';
import { getQuery, QUERY_TYPES } from '../../queries';
import { graphqlFetchPolicy, parsedImageAspectRatio } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { useHomeRefresh } from '../../hooks/HomeRefresh';

export const HomeCarousel = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);

  const refreshTime = useRefreshTime('publicJsonFile-homeCarousel');

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });

  const { data, loading, refetch } = useQuery(getQuery(QUERY_TYPES.PUBLIC_JSON_FILE), {
    variables: { name: 'homeCarousel' },
    fetchPolicy,
    skip: !refreshTime
  });

  useHomeRefresh(refetch);

  if (!refreshTime || loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  let homeCarouselData = [];

  try {
    homeCarouselData = JSON.parse(data?.publicJsonFile?.content);
  } catch (error) {
    console.warn(error, data);
  }

  if (!homeCarouselData || !homeCarouselData.length) return null;

  return (
    <ImagesCarousel
      navigation={navigation}
      data={_shuffle(homeCarouselData)}
      fetchPolicy={fetchPolicy}
      aspectRatio={parsedImageAspectRatio(globalSettings?.homeCarousel?.imageAspectRatio)}
    />
  );
};

HomeCarousel.propTypes = {
  navigation: PropTypes.object.isRequired
};

HomeCarousel.defaultProps = {
  refreshing: false
};
