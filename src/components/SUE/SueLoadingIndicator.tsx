import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, normalize } from '../../config';

export const SueLoadingIndicator = () => {
  return (
    <View style={styles.animationContainer}>
      <LottieView
        autoPlay
        source={require('../../../assets/lottie/SUE/broom.json')}
        style={styles.lottie}
      />
    </View>
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
  lottie: {
    // backgroundColor: colors.surface,
    // backgroundColor: colors.error,
    height: 200,
    width: 200
  }
});
