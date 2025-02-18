import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, normalize } from '../../config';
import { momentFormat } from '../../helpers';
import { HeadlineText, RegularText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from '../Wrapper';

import { Dot } from './WasteCalendarLegendEntry';

export const WasteCollectionListItem = ({ item: groupedItem, options }) => {
  const { groupKey, usedTypes } = options;
  const sectionHeaderTop = momentFormat(groupedItem[0][groupKey], 'dd');
  const sectionHeaderBottom = momentFormat(groupedItem[0][groupKey], 'DD');
  const dotsColors = groupedItem[0].dots.map((dot) => dot.color);

  return (
    <>
      <Wrapper style={styles.cell}>
        <WrapperRow>
          <View style={{ width: '15%' }}>
            <RegularText placeholder>{sectionHeaderTop}</RegularText>
            <HeadlineText biggest>{sectionHeaderBottom}</HeadlineText>
          </View>
          <WrapperHorizontal style={{ width: '85%' }}>
            {groupedItem.map((item) => (
              <View key={item.listDate}>
                {Object.keys(usedTypes).map(
                  (typeKey) =>
                    usedTypes[typeKey] &&
                    !!dotsColors &&
                    dotsColors.includes(usedTypes[typeKey].color) && (
                      <View key={usedTypes[typeKey].label}>
                        <WrapperRow style={styles.container}>
                          <Dot color={usedTypes[typeKey].color} />
                          {usedTypes[typeKey].color !== usedTypes[typeKey].selected_color && (
                            <Dot color={usedTypes[typeKey].selected_color} />
                          )}
                          <RegularText> {usedTypes[typeKey].label}</RegularText>
                        </WrapperRow>
                      </View>
                    )
                )}
              </View>
            ))}
          </WrapperHorizontal>
        </WrapperRow>
      </Wrapper>
      <Divider />
    </>
  );
};

const styles = StyleSheet.create({
  cell: {
    backgroundColor: colors.surface
  },
  container: {
    marginBottom: normalize(8),
    alignItems: 'center'
  }
});
