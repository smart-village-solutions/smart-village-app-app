import { StackHeaderLeftButtonProps } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, normalize } from '../config';
import { arrowLeft } from '../icons';

import { Icon } from './Icon';

export const HeaderLeft = ({ onPress }: StackHeaderLeftButtonProps) =>
  onPress ? (
    <View>
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel="Zurück Taste"
        accessibilityHint="Navigieren zurück zur vorherigen Seite"
      >
        <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
      </TouchableOpacity>
    </View>
  ) : null;

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});
