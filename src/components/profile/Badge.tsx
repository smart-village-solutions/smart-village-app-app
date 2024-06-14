import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Badge as RNBadge } from 'react-native-elements';

import { colors, normalize } from '../../config';
import { useMessagesContext } from '../../UnreadMessagesProvider';

export const Badge = ({
  badgeStyle,
  containerStyle
}: {
  badgeStyle?: ViewStyle;
  containerStyle?: ViewStyle;
}) => {
  const { count, loading } = useMessagesContext();

  if (loading || count === 0) {
    return null;
  }

  return (
    <RNBadge
      badgeStyle={[styles.badgeStyle, badgeStyle]}
      containerStyle={[styles.badgeContainer, containerStyle]}
      value={count}
    />
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    right: normalize(60),
    top: normalize(17)
  },
  badgeStyle: {
    backgroundColor: colors.error
  }
});
