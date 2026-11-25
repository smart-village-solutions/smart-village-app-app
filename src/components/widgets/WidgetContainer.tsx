import React, { ReactNode, useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { normalize } from '../../config';
import { normalizeStyleValues } from '../../helpers/normalizeStyleValues';

import { omitResponsiveDimensions, WidgetLayoutContext } from './WidgetLayoutContext';

type Props = {
  accessibilityLabel: string;
  children: ReactNode;
  onPress: () => void;
  widgetStyle?: unknown;
};

export const WidgetContainer = ({ accessibilityLabel, children, onPress, widgetStyle }: Props) => {
  const { mode, contentPaddingVertical } = useContext(WidgetLayoutContext);
  const normalizedStyle =
    StyleSheet.flatten(omitResponsiveDimensions(normalizeStyleValues(widgetStyle ?? {}))) || {};
  const paddingStyle = {
    padding: normalize(16),
    // An explicit all-edge override also replaces the layout's default horizontal inset.
    ...(normalizedStyle.padding == null && {
      paddingHorizontal: normalize(mode === 'list' ? 12 : 4),
      ...(contentPaddingVertical !== undefined && { paddingVertical: contentPaddingVertical })
    })
  };

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[paddingStyle, normalizedStyle, styles.container]}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%'
  }
});
