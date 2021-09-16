import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';

import { device } from '../../config';
import { User } from '../../types';
import { CircularView } from '../CircularView';
import { Image } from '../Image';

import { ImageBadge } from './ImageBadge';

type PropsWithoutPlaceholder = Pick<User, 'imageUri' | 'verified'>;
type Props =
  | (PropsWithoutPlaceholder & { placeholder?: string })
  | (Omit<PropsWithoutPlaceholder, 'imageUri'> &
      Partial<Pick<PropsWithoutPlaceholder, 'imageUri'>> & { placeholder: string });

export const ImageWithBadge = ({ verified, ...props }: Props) => {
  const uri = props.imageUri !== undefined ? props.imageUri : props.placeholder;

  return (
    <View style={styles.container}>
      <View>
        <CircularView size={device.width / 2}>
          <Image source={{ uri }} resizeMode="contain" />
        </CircularView>
        <ImageBadge verified={verified} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' }
});
