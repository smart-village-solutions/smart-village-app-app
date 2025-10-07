import React from 'react';
import { StyleSheet } from 'react-native';

import { colors, normalize } from '../../config';
import { Image } from '../Image';

export const SueLoadingIndicator = () => {
  return (
    <Image
      containerStyle={styles.animationContainer}
      source={require('../../../assets/lottie/SUE/broom.gif')}
      style={styles.image}
    />
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center',
    marginBottom: normalize(14)
  },
  image: {
    height: normalize(40),
    width: normalize(40)
  }
});
