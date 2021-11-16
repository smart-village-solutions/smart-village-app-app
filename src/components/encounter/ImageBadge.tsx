import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, Icon, normalize } from '../../config';

type Props = {
  verified: boolean;
};

export const ImageBadge = ({ verified }: Props) => {
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

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: 0,
    top: 0
  }
});
