import React from 'react';
import { StyleSheet } from 'react-native';
import { Direction } from 'react-native-calendars/src/types';

import { Icon, normalize } from '../config';

export const renderArrow = (direction: Direction, color?: string) =>
  direction === 'right' ? (
    <Icon.ArrowRight style={styles.icon} color={color} />
  ) : (
    <Icon.ArrowLeft style={styles.icon} color={color} />
  );

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});
