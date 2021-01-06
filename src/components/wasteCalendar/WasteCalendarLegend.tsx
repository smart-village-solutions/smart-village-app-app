import React from 'react';
import { StyleSheet, View } from 'react-native';
import { normalize } from '../../config';

import { WasteCollectionCalendarData } from '../../types';
import { RegularText } from '../Text';
import { WrapperHorizontal, WrapperRow, WrapperWrap } from '../Wrapper';

type EntryProps = {
  color: string;
  name: string;
  selectedColor: string;
};

const Dot = ({ color }: { color: string }) => {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
};

const WasteCalendarLegendEntry = ({ color, name, selectedColor }: EntryProps) => {
  return (
    <WrapperHorizontal>
      <WrapperRow>
        <RegularText small>{`${name} - `}</RegularText>
        <Dot color={color} />
        {color !== selectedColor && <Dot color={selectedColor} />}
      </WrapperRow>
    </WrapperHorizontal>
  );
};

export const WasteCalendarLegend = ({ data }: { data?: WasteCollectionCalendarData }) => {
  if (!data) {
    return null;
  }

  return (
    <WrapperWrap style={styles.marginBottom}>
      {Object.keys(data).map(
        (key) =>
          data[key] && (
            <WasteCalendarLegendEntry
              key={data[key].name}
              color={data[key].dot.color}
              selectedColor={data[key].dot.selectedColor}
              name={data[key].name}
            />
          )
      )}
    </WrapperWrap>
  );
};

const styles = StyleSheet.create({
  dot: {
    alignSelf: 'center',
    borderRadius: 2,
    height: 4,
    width: 4
  },
  marginBottom: {
    marginBottom: normalize(14)
  }
});
