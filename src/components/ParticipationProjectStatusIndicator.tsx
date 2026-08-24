import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, normalize, texts } from '../config';

import { RegularText } from './Text';

type Props = {
  color?: string;
  containerStyle?: StyleProp<ViewStyle>;
  label: string;
  small?: boolean;
};

export const ParticipationProjectStatusIndicator = ({
  color,
  containerStyle,
  label,
  small
}: Props) => (
  <View
    accessibilityLabel={`${texts.participationProject.status}: ${label}`}
    accessibilityRole="text"
    accessible
    style={[styles.container, containerStyle]}
  >
    {!!color && (
      <View
        accessible={false}
        importantForAccessibility="no"
        style={[styles.dot, { backgroundColor: color }]}
      />
    )}
    <RegularText accessible={false} importantForAccessibility="no" small={small}>
      {label}
    </RegularText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  dot: {
    borderColor: colors.darkText,
    borderRadius: normalize(6),
    borderWidth: StyleSheet.hairlineWidth,
    height: normalize(12),
    marginRight: normalize(8),
    width: normalize(12)
  }
});
