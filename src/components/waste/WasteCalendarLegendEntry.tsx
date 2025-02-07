import React from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize } from '../../config';
import { RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';

type EntryProps = {
  color: string;
  label: string;
  selectedColor: string;
};

export const Dot = ({ center, color }: { center?: boolean; color: string }) => {
  return <View style={[styles.dot, center && styles.center, { backgroundColor: color }]} />;
};

export const WasteCalendarLegendEntry = ({ color, label, selectedColor }: EntryProps) => {
  return (
    <WrapperVertical>
      <WrapperRow>
        <Dot color={color} />
        {color !== selectedColor && <Dot center color={selectedColor} />}
        <RegularText small>{label}</RegularText>
      </WrapperRow>
    </WrapperVertical>
  );
};

const styles = StyleSheet.create({
  center: {
    alignSelf: 'center'
  },
  dot: {
    borderRadius: normalize(16),
    height: normalize(16),
    marginRight: normalize(4),
    width: normalize(16)
  }
});
