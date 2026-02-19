import React from 'react';
import { StyleSheet } from 'react-native';

import { normalize } from '../../config';
import { WasteTypeData } from '../../types';
import { WrapperVertical } from '../Wrapper';

import { WasteCalendarLegendEntry } from './WasteCalendarLegendEntry';

export const WasteCalendarLegend = ({
  data,
  selectedDay
}: {
  data?: WasteTypeData;
  selectedDay: {
    dots: { color: string; selectedColor: string }[];
    note?: string | null;
  };
}) => {
  const { dots = [], note = null } = selectedDay || {};
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
              color={selectedData[key].color}
              dotStyle={styles.dot}
              key={selectedData[key].label}
              label={`${selectedData[key].label}`}
              note={note}
              selectedColor={selectedData[key].selected_color}
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
  }
});
