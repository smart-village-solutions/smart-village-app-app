import React from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize } from '../../config';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

type EntryProps = {
  color: string;
  dotStyle?: any;
  label: string;
  note?: string | null;
  selectedColor: string;
};

export const Dot = ({ color, style }: { color: string; style?: any }) => {
  return <View style={[styles.dot, { backgroundColor: color }, style]} />;
};

export const WasteCalendarLegendEntry = ({
  color,
  dotStyle,
  label,
  note,
  selectedColor
}: EntryProps) => {
  return (
    <WrapperRow style={styles.marginBottom}>
      <Dot color={color} style={dotStyle} />
      {color !== selectedColor && <Dot color={selectedColor} style={dotStyle} />}
      <View style={styles.labelContainer}>
        <RegularText small>{label} </RegularText>
        {!!note && (
          <RegularText small error>
            {note}
          </RegularText>
        )}
      </View>
    </WrapperRow>
  );
};

const styles = StyleSheet.create({
  dot: {
    borderRadius: normalize(16),
    height: normalize(16),
    marginRight: normalize(8),
    width: normalize(16)
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  marginBottom: {
    marginBottom: normalize(8)
  }
});
