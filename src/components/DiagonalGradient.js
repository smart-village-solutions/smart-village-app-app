import { LinearGradient } from 'expo-linear-gradient';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import { colors } from '../config';

export const DiagonalGradient = ({
  children,
  colors: gradientColors = [colors.primary, colors.primary],
  end = { x: 1, y: 1 },
  start = { x: 0, y: 0 },
  style = { flex: 1 },
  ...props
}) => {
  // If all gradient colors are the same (or only one), we can skip LinearGradient for performance.
  const isUniformColor =
    Array.isArray(gradientColors) &&
    gradientColors.length > 0 &&
    gradientColors.every((gradientColor) => gradientColor === gradientColors[0]);

  if (isUniformColor) {
    const backgroundColor = gradientColors[0] || colors.primary;

    return children ? (
      <View style={[style, { backgroundColor }]} {...props}>
        {children}
      </View>
    ) : (
      <View style={[style, { backgroundColor }]} {...props} />
    );
  }

  return children ? (
    <LinearGradient colors={gradientColors} start={start} end={end} style={style} {...props}>
      {children}
    </LinearGradient>
  ) : (
    <LinearGradient colors={gradientColors} start={start} end={end} style={style} {...props} />
  );
};

DiagonalGradient.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  colors: PropTypes.array,
  start: PropTypes.object,
  end: PropTypes.object,
  style: PropTypes.object
};
