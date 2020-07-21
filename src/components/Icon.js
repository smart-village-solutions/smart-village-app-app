import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { normalize } from '../config';

export const Icon = ({ icon, width, height, style }) => (
  <View style={style}>
    <SvgXml width={width} height={height} xml={icon} />
  </View>
);

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.object
};

Icon.defaultProps = {
  width: normalize(24),
  height: normalize(24)
};
