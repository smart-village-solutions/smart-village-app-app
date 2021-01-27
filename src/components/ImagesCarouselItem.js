import PropTypes from 'prop-types';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Image } from './Image';

/**
 * Smart item component for `ImagesCarousel`, that renders an image or an image wrapped in a
 * touchable that can navigate to a given `routeName` with `params`.
 *
 * @return {ReactElement} `Image` or an `Image` wrapped in a `TouchableOpacity`
 */
export const ImagesCarouselItem = ({ navigation, source, containerStyle, aspectRatio }) => {
  const { routeName, params } = source;

  if (routeName && params) {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate({ routeName, params })}
        activeOpacity={0.8}
      >
        <Image {...{ source, containerStyle, aspectRatio }} />
      </TouchableOpacity>
    );
  }

  return <Image {...{ source, containerStyle, aspectRatio }} />;
};

ImagesCarouselItem.propTypes = {
  navigation: PropTypes.object,
  source: PropTypes.object.isRequired,
  containerStyle: PropTypes.object,
  aspectRatio: PropTypes.object
};
