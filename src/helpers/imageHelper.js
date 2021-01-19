import _filter from 'lodash/filter';
import { Dimensions } from 'react-native';

import { consts } from '../config';

const { IMAGE_ASPECT_RATIO } = consts;

export const imageWidth = () => Dimensions.get('window').width;

export const imageHeight = (width) => {
  // for accurate ratio in our view we need to calculate a factor with our current device
  // width for the image, to set a correct height
  const factor = width / IMAGE_ASPECT_RATIO.WIDTH;

  return IMAGE_ASPECT_RATIO.HEIGHT * factor;
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
