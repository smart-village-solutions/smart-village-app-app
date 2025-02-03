import React from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize } from '../../config';
import { WasteTypeData } from '../../types';
import { RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';

type EntryProps = {
  color: string;
  label: string;
  selectedColor: string;
};

const Dot = ({ color }: { color: string }) => {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
};

const WasteCalendarLegendEntry = ({ color, label, selectedColor }: EntryProps) => {
  return (
    <WrapperRow style={styles.marginBottom}>
      <Dot color={color} />
      {color !== selectedColor && <Dot color={selectedColor} />}
      <RegularText>{`  ${label}`}</RegularText>
    </WrapperRow>
  );
};

export const WasteCalendarLegend = ({
  data,
  dots
}: {
  data?: WasteTypeData;
  dots: {
    color: string;
    selectedColor: string;
  }[];
}) => {
  if (!data || !dots?.length) {
    return null;
  }

  const dotsColors = dots.map((dot) => dot.color);
  const selectedData = Object.keys(data).reduce((acc, key) => {
    if (dotsColors.includes(data[key].color)) {
      acc[key] = data[key];
    }
    return acc;
  }, {});

  return (
    <WrapperVertical>
      {Object.keys(selectedData).map(
        (key) =>
          selectedData[key] && (
            <WasteCalendarLegendEntry
              key={selectedData[key].label}
              color={selectedData[key].color}
              selectedColor={selectedData[key].selected_color}
              label={selectedData[key].label}
            />
          )
      )}
    </WrapperVertical>
  );
};

const styles = StyleSheet.create({
  dot: {
    alignSelf: 'center',
    borderRadius: normalize(10) / 2,
    height: normalize(10),
    margin: normalize(2),
    width: normalize(10)
  },
  marginBottom: {
    marginBottom: normalize(8)
  }
});
