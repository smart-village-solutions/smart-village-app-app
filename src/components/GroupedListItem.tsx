import React from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { normalize } from '../config';
import { momentFormat, removeHtml } from '../helpers';
import { ScreenName } from '../types';
import { useThemeStyles } from '../hooks/useThemeStyles';

import { BoldText, HeadlineText, RegularText } from './Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from './Wrapper';

export const GroupedListItem = ({ item: groupedItem, navigation, options }) => {
  const styles = useThemeStyles(createStyles);
  const sectionHeaderTop = momentFormat(groupedItem[0][options.groupKey], 'dd');
  const sectionHeaderBottom = momentFormat(groupedItem[0][options.groupKey], 'DD');

  return (
    <Wrapper style={styles.cell}>
      <WrapperRow>
        <View style={styles.width15}>
          <RegularText lighter>{sectionHeaderTop}</RegularText>
          <HeadlineText big>{sectionHeaderBottom}</HeadlineText>
        </View>
        <WrapperHorizontal style={styles.width85}>
          {groupedItem.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                accessibilityLabel={item.topTitle ? `${item.topTitle} (${item.title})` : item.title}
                onPress={() => navigation.navigate(ScreenName.Detail, item.params)}
              >
                {!!item.topTitle && (
                  <BoldText small lighter>
                    {item.topTitle}
                  </BoldText>
                )}
                {!!item.title && <BoldText numberOfLines={2}>{item.title}</BoldText>}
                {!!item.subtitle && (
                  <RegularText numberOfLines={2}>{removeHtml(item.subtitle)}</RegularText>
                )}
              </TouchableOpacity>
              {index < groupedItem.length - 1 && <View style={styles.spacerTiny} />}
            </View>
          ))}
        </WrapperHorizontal>
      </WrapperRow>
    </Wrapper>
  );
};

const createStyles = (colors) => ({
  cell: {
    backgroundColor: colors.gray20
  },

  spacerTiny: {
    marginBottom: normalize(16)
  },

  width15: {
    width: '15%'
  },

  width85: {
    width: '85%'
  }
});
