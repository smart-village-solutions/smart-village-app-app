import React, { useContext } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsContext } from '../SettingsProvider';
import { useTheme } from '../hooks/useTheme';

export const SafeAreaViewFlex = ({
  children,
  style,
  ...props
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  [key: string]: any;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { colors } = useTheme();
  const { navigation = 'tab' } = globalSettings;

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: colors.background }, style]}
      edges={navigation === 'tab' ? [] : ['bottom']}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});
