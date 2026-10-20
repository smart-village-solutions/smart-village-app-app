import React, { useCallback, useContext } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { BookmarkContext } from '../../BookmarkProvider';
import { Icon, colors, consts, normalize, texts } from '../../config';
import { useBookmarkedStatus } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { TDiscount } from '../../types';
import { ConfiguredBookmarkIcon } from '../bookmarks/BookmarkIcon';
import { hasVoucherDiscount } from '../../helpers/voucherDiscount';
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
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const { toggleBookmark } = useContext(BookmarkContext);
  const { discountAmount, discountedPrice, discountPercentage, originalPrice } = discount;
  const hasDiscountedPrice = discountedPrice != null && Number.isFinite(discountedPrice);
  const hasPercentage = discountPercentage != null && discountPercentage > 0;
  const hasAmount = discountAmount != null && discountAmount > 0;

  const isBookmarked = useBookmarkedStatus(query, id);

  const onPress = useCallback(() => {
    toggleBookmark(query, payloadId);
  }, [toggleBookmark, query, payloadId]);

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        {hasDiscountedPrice && (
          <View style={styles.discountedPriceContainer}>
            <BoldText lightest>{toLocaleString(discountedPrice!)}</BoldText>
          </View>
        )}

        {originalPrice != null && Number.isFinite(originalPrice) && (
          <RegularText lineThrough={hasVoucherDiscount(discount)} lighter>
            {toLocaleString(originalPrice)}
          </RegularText>
        )}

        {hasPercentage && (
          <RegularText primary>
            {texts.voucher.detailScreen.discountPercentage(
              discountPercentage!.toLocaleString(localeString)
            )}
          </RegularText>
        )}

        {hasAmount && !hasPercentage && (
          <RegularText primary>
            {texts.voucher.detailScreen.discountAmount(toLocaleString(discountAmount!))}
          </RegularText>
        )}
      </View>

      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={a11yLabel.bookmarkList}
        accessibilityHint={a11yLabel.bookmarkListHint}
      >
        <ConfiguredBookmarkIcon
          color={colors.primary}
          selected={isBookmarked}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors) => ({
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
