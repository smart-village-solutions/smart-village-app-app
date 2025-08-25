import React, { useCallback, useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { BookmarkContext } from '../../BookmarkProvider';
import { Icon, colors, consts, normalize } from '../../config';
import { useBookmarkedStatus } from '../../hooks';
import { TDiscount } from '../../types';
import { BoldText, RegularText } from '../Text';

const a11yLabel = consts.a11yLabel;
const localeString = 'de';

const toLocaleString = (value: number) =>
  value.toLocaleString(localeString, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

export const Discount = ({
  discount,
  id,
  payloadId,
  query
}: {
  discount: TDiscount;
  id: string;
  payloadId: string;
  query: string;
}) => {
  const { toggleBookmark } = useContext(BookmarkContext);
  const { discountAmount, discountedPrice, originalPrice } = discount;

  const isBookmarked = useBookmarkedStatus(query, id);

  const onPress = useCallback(() => {
    toggleBookmark(query, payloadId);
  }, [toggleBookmark, query, payloadId]);

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        {!!discountedPrice && (
          <View style={styles.discountedPriceContainer}>
            <BoldText lightest>{toLocaleString(discountedPrice)}</BoldText>
          </View>
        )}

        {!!originalPrice && (
          <RegularText lineThrough lighter>
            {toLocaleString(originalPrice)}
          </RegularText>
        )}

        {!!discountAmount && <RegularText primary> -{toLocaleString(discountAmount)}</RegularText>}
      </View>

      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={a11yLabel.bookmarkList}
        accessibilityHint={a11yLabel.bookmarkListHint}
      >
        {isBookmarked ? (
          <Icon.HeartFilled color={colors.primary} style={styles.icon} />
        ) : (
          <Icon.HeartEmpty color={colors.primary} style={styles.icon} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  discountedPriceContainer: {
    backgroundColor: colors.primary,
    borderRadius: normalize(4),
    marginRight: normalize(12),
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2)
  },
  icon: {
    paddingHorizontal: normalize(7),
    paddingVertical: normalize(4)
  }
});
