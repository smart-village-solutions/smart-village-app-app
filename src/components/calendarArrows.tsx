import React from 'react';

import { StyleSheet } from 'react-native';
import { colors, normalize } from '../config';
import { arrowLeft, arrowRight } from '../icons';
import { Icon } from './Icon';

export const renderArrow = (direction: 'left' | 'right') =>
  direction === 'right' ? (
    <Icon xml={arrowRight(colors.primary)} style={styles.icon} />
  ) : (
    <Icon xml={arrowLeft(colors.primary)} style={styles.icon} />
  );

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});
