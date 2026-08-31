import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';

import { consts } from '../config';
import { navigateToRoute } from '../helpers';

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
    isImageFullWidth,
    message,
    navigation,
    onContentHeightChange,
    refreshInterval,
    source,
    style
  }) => {
    const { routeName: name, params, targetTabIndex } = source;
    const accessibilityLabel =
      source.accessibilityLabel?.trim?.() ||
      source.captionText?.trim?.() ||
      consts.a11yLabel.imageCarousel;

    if (name && params) {
      return (
        <TouchableOpacity
          accessible
          accessibilityLabel={`${accessibilityLabel} ${consts.a11yLabel.button}`}
          accessibilityRole="button"
          onPress={() =>
            navigateToRoute({
              navigation,
              params,
              routeName: name,
              targetTabIndex
            })
          }
          activeOpacity={0.8}
        >
          <Image
            {...{
              accessible: false,
              button,
              source,
              message,
              containerStyle,
              aspectRatio,
              isImageFullWidth,
              onContentHeightChange,
              style
            }}
          />
        </TouchableOpacity>
      );
    }

    return (
      <Image
        {...{
          button,
          buttons,
          source,
          message,
          containerStyle,
          aspectRatio,
          isImageFullWidth,
          onContentHeightChange,
          refreshInterval,
          style
        }}
      />
    );
  }
);

ImagesCarouselItem.displayName = 'ImagesCarouselItem';

ImagesCarouselItem.propTypes = {
  aspectRatio: PropTypes.object,
  button: PropTypes.object,
  buttons: PropTypes.arrayOf(PropTypes.object),
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  isImageFullWidth: PropTypes.bool,
  message: PropTypes.string,
  navigation: PropTypes.object,
  onContentHeightChange: PropTypes.func,
  refreshInterval: PropTypes.number,
  source: PropTypes.object.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};
