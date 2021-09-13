import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';

import { colors, device } from '../../config';
import { User } from '../../types';
import { Image } from '../Image';

import { ImageBadge } from './ImageBadge';
type Props = Pick<User, 'imageUri' | 'verified'>;
export const ImageWithBadge = ({ imageUri, verified }: Props) => {
  return (
    <View style={styles.container}>
      <View>
        <View style={styles.circle}>
          <Image source={{ uri: imageUri }} resizeMode="contain" />
        </View>
        <ImageBadge verified={verified} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: device.width / 4,
    justifyContent: 'center',
    overflow: 'hidden',
    width: device.width / 2
  },
  container: { alignItems: 'center' }
});
