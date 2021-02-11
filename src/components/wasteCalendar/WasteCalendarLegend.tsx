import React from 'react';
import { StyleSheet, View } from 'react-native';
import { normalize } from '../../config';

import { WasteTypeData } from '../../types';
import { RegularText } from '../Text';
import { WrapperHorizontal, WrapperRow, WrapperWrap } from '../Wrapper';

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
    <WrapperHorizontal>
      <WrapperRow>
        <RegularText small>{`${label} - `}</RegularText>
        <Dot color={color} />
        {color !== selectedColor && <Dot color={selectedColor} />}
      </WrapperRow>
    </WrapperHorizontal>
  );
};

export const WasteCalendarLegend = ({ data }: { data?: WasteTypeData }) => {
  if (!data) {
    return null;
  }

  return (
    <WrapperWrap style={styles.marginBottom}>
      {Object.keys(data).map(
        (key) =>
          data[key] && (
            <WasteCalendarLegendEntry
              key={data[key].label}
              color={data[key].color}
              selectedColor={data[key].selected_color}
              label={data[key].label}
            />
          )
      )}
    </WrapperWrap>
  );
};

const styles = StyleSheet.create({
  dot: {
    alignSelf: 'center',
    borderRadius: 3,
    height: 6,
    margin: normalize(2),
    width: 6
  },
  marginBottom: {
    marginBottom: normalize(14)
  }
});
