import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '../config';

type Props = {
  loading?: boolean;
};

export const LoadingSpinnerMap = ({ loading }: Props) => {
  if (!loading) return null;

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={colors.refreshControl} />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  }
});
