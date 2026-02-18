import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SafeAreaViewFlex = ({
  children,
  style,
  ...props
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  [key: string]: any;
}) => {
  return (
    <SafeAreaView style={[styles.flex, style]} edges={[]} {...props}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});
