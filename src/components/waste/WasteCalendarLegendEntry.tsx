import React from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize } from '../../config';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

type EntryProps = {
  color: string;
  label: string;
  selectedColor: string;
  dotStyle?: any;
};

export const Dot = ({ color, style }: { color: string; style?: any }) => {
  return <View style={[styles.dot, { backgroundColor: color }, style]} />;
};

export const WasteCalendarLegendEntry = ({ color, label, selectedColor, dotStyle }: EntryProps) => {
  return (
    <WrapperRow style={styles.marginBottom}>
      <Dot color={color} style={dotStyle} />
      {color !== selectedColor && <Dot color={selectedColor} style={dotStyle} />}
      <RegularText small>{label}</RegularText>
    </WrapperRow>
  );
};

const styles = StyleSheet.create({
  dot: {
    borderRadius: normalize(16),
    height: normalize(16),
    marginRight: normalize(4),
    width: normalize(16)
  },
  marginBottom: {
    marginBottom: normalize(8)
  }
});
