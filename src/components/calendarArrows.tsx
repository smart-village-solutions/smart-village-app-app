import React from 'react';
import { StyleSheet } from 'react-native';

import { NewIcon, normalize } from '../config';

export const renderArrow = (direction: 'left' | 'right') =>
  direction === 'right' ? (
    <NewIcon.ArrowRight style={styles.icon} />
  ) : (
    <NewIcon.ArrowLeft style={styles.icon} />
  );

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});
