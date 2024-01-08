import React, { useCallback, useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { BookmarkContext } from '../../BookmarkProvider';
import { Icon, colors, consts, normalize } from '../../config';
import { useBookmarkedStatus } from '../../hooks';
import { togglePushDeviceAssignment } from '../../pushNotifications';
import { TDiscount } from '../../types';
import { BoldText, RegularText } from '../Text';

const a11yLabel = consts.a11yLabel;

export const Discount = ({
  discount,
  query,
  id
}: {
  discount: TDiscount;
  query: string;
  id: string;
}) => {
  const { toggleBookmark } = useContext(BookmarkContext);
  const { discountAmount, discountedPrice, originalPrice } = discount;

  const isBookmarked = useBookmarkedStatus(query, id);

  const onPress = useCallback(() => {
    toggleBookmark(query, id);
    togglePushDeviceAssignment(
      id,
      query.charAt(0).toUpperCase() + query.slice(1), // convert first character to uppercase
      isBookmarked ? 'DELETE' : 'POST'
    );
  }, [id, query]);

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <View style={styles.discountedPriceContainer}>
          <BoldText lightest>{discountedPrice} €</BoldText>
        </View>

        <RegularText lineThrough lighter>
          {originalPrice} €
        </RegularText>
        <RegularText primary> -{discountAmount} €</RegularText>
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
