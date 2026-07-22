import React from 'react';
import 'react-native';

import { normalize } from '../../config';
import { Image } from '../Image';
import { useThemeStyles } from '../../hooks/useThemeStyles';

export const SueLoadingIndicator = () => {
  const styles = useThemeStyles(createStyles);
  return (
    <Image
      containerStyle={styles.animationContainer}
      source={require('../../../assets/lottie/SUE/broom.gif')}
      style={styles.image}
    />
  );
};

const createStyles = (colors) => ({
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
