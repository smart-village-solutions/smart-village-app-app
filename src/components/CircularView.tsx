import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = View['props'] & { size: number };

export const CircularView = ({ size, style, ...otherProps }: Props) => {
  const circleStyle = useMemo(() => getStyle(size).circle, [size]);

  return <View {...otherProps} style={[circleStyle, style]} />;
};

const getStyle = (size: number) =>
  StyleSheet.create({
    // eslint does not detect the function being called at the top
    // eslint-disable-next-line react-native/no-unused-styles
    circle: {
      alignItems: 'center',
      aspectRatio: 1,
      borderRadius: size / 2,
      justifyContent: 'center',
      overflow: 'hidden',
      width: size
    }
  });
