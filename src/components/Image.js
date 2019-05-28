import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Image as RNEImage } from 'react-native-elements';

import { colors, device } from '../config';

const imageWidth = device.width;
// image aspect ratio is 360x180, so for accurate ratio in our view we need to calculate
// a factor with our current device with for the image, to set a correct height
const factor = imageWidth / 360;
const imageHeight = 180 * factor;

export const Image = (props) => (
  <RNEImage
    {...props}
    PlaceholderContent={<ActivityIndicator />}
    placeholderStyle={{ backgroundColor: colors.lightestText }}
  />
);

Image.propTypes = {
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  style: PropTypes.object
};

Image.defaultProps = {
  style: {
    alignSelf: 'center',
    height: imageHeight,
    width: imageWidth
  }
};
