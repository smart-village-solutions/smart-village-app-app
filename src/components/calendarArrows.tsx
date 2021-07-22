import React from 'react';
import { StyleSheet } from 'react-native';

import { Icon, normalize } from '../config';

export const renderArrow = (direction: 'left' | 'right') =>
  direction === 'right' ? (
    <Icon.ArrowRight style={styles.icon} />
  ) : (
    <Icon.ArrowLeft style={styles.icon} />
  );

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});
