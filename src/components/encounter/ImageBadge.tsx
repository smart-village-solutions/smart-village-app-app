import React from 'react';
import { View } from 'react-native';

import { Icon, normalize } from '../../config';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

type Props = {
  verified: boolean;
};

export const ImageBadge = ({ verified }: Props) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  return (
    <View style={styles.badge}>
      {verified ? (
        <Icon.VerifiedBadge color={colors.secondary} size={normalize(44)} />
      ) : (
        <Icon.NotVerifiedBadge color={colors.secondary} size={normalize(44)} />
      )}
    </View>
  );
};

const createStyles = () => ({
  badge: {
    position: 'absolute',
    right: 0,
    top: 0
  }
});
