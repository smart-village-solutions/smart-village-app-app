import _shuffle from 'lodash/shuffle';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator } from 'react-native';

import { colors } from '../config';
import { graphqlFetchPolicy, parsedImageAspectRatio } from '../helpers';
import { useRefreshTime } from '../hooks';
import { useHomeRefresh } from '../hooks/HomeRefresh';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';
import { ImagesCarousel } from './ImagesCarousel';
import { LoadingContainer } from './LoadingContainer';

export const ConnectedImagesCarousel = ({
  alternateAspectRatio,
  navigation,
  publicJsonFile,
  refreshTimeKey
}) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);

  const refreshTime = useRefreshTime(refreshTimeKey);

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });

  const { data, loading, refetch } = useQuery(getQuery(QUERY_TYPES.PUBLIC_JSON_FILE), {
    variables: { name: publicJsonFile },
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

  let publicJsonFileData = [];

  try {
    publicJsonFileData = JSON.parse(data?.publicJsonFile?.content);
  } catch (error) {
    console.warn(error, data);
  }

  if (!publicJsonFileData || !publicJsonFileData.length) return null;

  return (
    <ImagesCarousel
      navigation={navigation}
      data={_shuffle(publicJsonFileData)}
      fetchPolicy={fetchPolicy}
      aspectRatio={
        alternateAspectRatio
          ? parsedImageAspectRatio(globalSettings?.homeCarousel?.imageAspectRatio)
          : undefined
      }
    />
  );
};

ConnectedImagesCarousel.propTypes = {
  alternateAspectRatio: PropTypes.bool,
  navigation: PropTypes.object.isRequired,
  publicJsonFile: PropTypes.string.isRequired,
  refreshTimeKey: PropTypes.string.isRequired
};

ConnectedImagesCarousel.defaultProps = {
  alternateAspectRatio: false,
  refreshing: false
};
