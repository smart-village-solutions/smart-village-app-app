import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
// https://github.com/vault-development/react-native-svg-uri
import SvgUri from 'react-native-svg-uri';

export const Icon = ({ icon, width, height, style }) => (
  <View style={style}>
    <SvgUri width={width} height={height} svgXmlData={icon} />
  </View>
);

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  style: PropTypes.string
};
