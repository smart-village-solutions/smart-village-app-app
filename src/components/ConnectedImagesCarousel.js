import _shuffle from 'lodash/shuffle';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ActivityIndicator } from 'react-native';

import { colors } from '../config';
import { parsedImageAspectRatio } from '../helpers';
import { useHomeRefresh, useStaticContent } from '../hooks';
import { SettingsContext } from '../SettingsProvider';

import { ImagesCarousel } from './ImagesCarousel';
import { LoadingContainer } from './LoadingContainer';

export const ConnectedImagesCarousel = ({ navigation, publicJsonFile, refreshTimeKey }) => {
  const { data, loading, refetch } = useStaticContent({
    refreshTimeKey: refreshTimeKey || `publicJsonFile-${publicJsonFile}`,
    name: publicJsonFile,
    type: 'json'
  });
  const { globalSettings } = useContext(SettingsContext);

  useHomeRefresh(refetch);

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  return (
    <ImagesCarousel
      navigation={navigation}
      data={_shuffle(data)}
      refreshTimeKey={`publicJsonFile-${publicJsonFile}`}
      aspectRatio={
        globalSettings?.[publicJsonFile]?.imageAspectRatio
          ? parsedImageAspectRatio(globalSettings[publicJsonFile].imageAspectRatio)
          : undefined
      }
    />
  );
};

ConnectedImagesCarousel.propTypes = {
  navigation: PropTypes.object.isRequired,
  publicJsonFile: PropTypes.string.isRequired,
  refreshTimeKey: PropTypes.string
};
