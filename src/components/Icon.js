import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { normalize } from '../config';
import { OrientationContext } from '../OrientationProvider';

export const Icon = ({ icon, width, height, style }) => {
  const { orientation } = useContext(OrientationContext);
  const landscapeStyle = orientation === 'landscape' ? style : null;

  return (
    <View style={landscapeStyle}>
      <SvgXml width={width} height={height} xml={icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  marginIcon: {
    marginRight: normalize(10)
  }
});

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.object
};

Icon.defaultProps = {
  width: normalize(24),
  height: normalize(24),
  style: styles.marginIcon
};
