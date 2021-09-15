import React from 'react';
import { StyleSheet, View } from 'react-native';
import { normalize } from 'react-native-elements';

import { colors, device } from '../../config';
import { Image } from '../Image';

type Props = {
  verified: boolean;
};

export const ImageBadge = ({ verified }: Props) => {
  return (
    <View style={[styles.badge, styles.shadow]}>
      <View style={styles.badge}>
        <Image
          // TODO: add proper badges
          source={
            verified ? require('../../../assets/icon.png') : require('../../../assets/icon.png')
          }
          resizeMode="contain"
          style={styles.badgeImage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.surface,
    aspectRatio: 1,
    borderRadius: device.width / 18,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    width: device.width / 9
  },
  badgeImage: { aspectRatio: 1, width: '100%' },
  shadow: {
    overflow: 'visible',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { height: 0, width: 0 },
    shadowRadius: normalize(2)
  }
});
