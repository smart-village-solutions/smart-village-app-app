import { LinearGradient } from 'expo-linear-gradient';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../hooks/useTheme';

export const DiagonalGradient = ({
  children,
  colors: gradientColors,
  end = { x: 1, y: 1 },
  start = { x: 0, y: 0 },
  style = { flex: 1 },
  ...props
}) => {
  const { colors } = useTheme();
  const resolvedGradientColors = gradientColors || [colors.primary, colors.primary];
  // If all gradient colors are the same (or only one), we can skip LinearGradient for performance.
  const isUniformColor =
    Array.isArray(resolvedGradientColors) &&
    resolvedGradientColors.length > 0 &&
    resolvedGradientColors.every((gradientColor) => gradientColor === resolvedGradientColors[0]);

  if (isUniformColor) {
    const backgroundColor = resolvedGradientColors[0] || colors.primary;

    return children ? (
      <View style={[style, { backgroundColor }]} {...props}>
        {children}
      </View>
    ) : (
      <View style={[style, { backgroundColor }]} {...props} />
    );
  }

  return children ? (
    <LinearGradient
      colors={resolvedGradientColors}
      start={start}
      end={end}
      style={style}
      {...props}
    >
      {children}
    </LinearGradient>
  ) : (
    <LinearGradient
      colors={resolvedGradientColors}
      start={start}
      end={end}
      style={style}
      {...props}
    />
  );
};

DiagonalGradient.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  colors: PropTypes.array,
  start: PropTypes.object,
  end: PropTypes.object,
  style: PropTypes.object
};
