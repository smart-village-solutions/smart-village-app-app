import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';

import { consts } from '../config';

import { Image } from './Image';

/**
 * Smart item component for `ImagesCarousel`, that renders an image or an image wrapped in a
 * touchable that can navigate to a given `routeName` with `params`.
 *
 * @return {ReactElement} `Image` or an `Image` wrapped in a `TouchableOpacity`
 */
export const ImagesCarouselItem = memo(
  ({
    aspectRatio,
    button,
    buttons,
    containerStyle,
    message,
    navigation,
    refreshInterval,
    source
  }) => {
    const { routeName: name, params } = source;

    if (name && params) {
      return (
        <TouchableOpacity
          accessibilityLabel={`${
            source.captionText ? source.captionText : consts.a11yLabel.imageCarousel
          } ${consts.a11yLabel.button}`}
          onPress={() => navigation.navigate({ name, params })}
          activeOpacity={0.8}
        >
          <Image {...{ button, source, message, containerStyle, aspectRatio }} />
        </TouchableOpacity>
      );
    }

    return (
      <Image
        {...{ button, buttons, source, message, containerStyle, aspectRatio, refreshInterval }}
      />
    );
  }
);

ImagesCarouselItem.displayName = 'ImagesCarouselItem';

ImagesCarouselItem.propTypes = {
  aspectRatio: PropTypes.object,
  button: PropTypes.object,
  buttons: PropTypes.arrayOf(PropTypes.object),
  containerStyle: PropTypes.object,
  message: PropTypes.string,
  navigation: PropTypes.object,
  refreshInterval: PropTypes.number,
  source: PropTypes.object.isRequired
};
