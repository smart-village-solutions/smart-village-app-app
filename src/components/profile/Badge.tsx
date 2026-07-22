import React from 'react';
import { ViewStyle } from 'react-native';
import { Badge as RNBadge } from 'react-native-elements';

import { normalize } from '../../config';
import { useMessagesContext } from '../../UnreadMessagesProvider';
import { useThemeStyles } from '../../hooks/useThemeStyles';

export const Badge = ({
  badgeStyle,
  containerStyle
}: {
  badgeStyle?: ViewStyle;
  containerStyle?: ViewStyle;
}) => {
  const styles = useThemeStyles(createStyles);
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

const createStyles = (colors) => ({
  badgeContainer: {
    position: 'absolute',
    right: normalize(60),
    top: normalize(17)
  },

  badgeStyle: {
    backgroundColor: colors.error
  }
});
