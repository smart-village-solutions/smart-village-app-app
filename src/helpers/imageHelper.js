import _filter from 'lodash/filter';
import _isArray from 'lodash/isArray';
import _isString from 'lodash/isString';
import _isInteger from 'lodash/isInteger';
import { Dimensions } from 'react-native';

import { consts } from '../config';

export const imageWidth = () => Dimensions.get('window').width;

export const imageHeight = (width, aspectRatio) => {
  const { IMAGE_ASPECT_RATIO } = consts;

  if (!aspectRatio) aspectRatio = IMAGE_ASPECT_RATIO;

  // for accurate ratio in our view we need to calculate a factor with our current device
  // width for the image, to set a correct height
  const factor = width / aspectRatio.WIDTH;

  return aspectRatio.HEIGHT * factor;
};

export const mainImageOfMediaContents = (mediaContents) => {
  if (!mediaContents || !mediaContents.length) return null;

  let images = _filter(
    mediaContents,
    (mediaContent) =>
      mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
  );

  if (!images || !images.length) return null;

  images = _filter(images, (image) => image.sourceUrl && image.sourceUrl.url);

  if (!images || !images.length) return null;

  return images[0].sourceUrl.url;
};

/**
 * Parses a string with an image aspect ratio with 'width:height' format and returns
 * and object with both values. If the value cannot be parsed, the default `IMAGE_ASPECT_RATIO`
 * will be returned.
 *
 * @param {string} imageAspectRatio two values divided by a colon, something like '1:1'
 *
 * @return {object} both parsed values as an object, like { HEIGHT: 1, WIDTH: 1}
 */
export const parsedImageAspectRatio = (imageAspectRatio) => {
  const { IMAGE_ASPECT_RATIO } = consts;

  const splitImageAspectRatio =
    imageAspectRatio && _isString(imageAspectRatio) && imageAspectRatio.split(':');

  if (
    splitImageAspectRatio &&
    _isArray(splitImageAspectRatio) &&
    splitImageAspectRatio.length === 2
  ) {
    const imageAspectRatioHeight = parseInt(splitImageAspectRatio[1], 10);
    const imageAspectRatioWidth = parseInt(splitImageAspectRatio[0], 10);

    if (_isInteger(imageAspectRatioHeight) && _isInteger(imageAspectRatioWidth)) {
      return { HEIGHT: imageAspectRatioHeight, WIDTH: imageAspectRatioWidth };
    }
  }

  return IMAGE_ASPECT_RATIO;
};
