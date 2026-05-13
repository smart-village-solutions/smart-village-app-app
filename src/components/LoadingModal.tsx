import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { colors } from '../config';

import { LoadingSpinner } from './LoadingSpinner';

export const LoadingModal = ({ loading }: { loading?: boolean }) => (
  <Modal
    animationType="none"
    transparent={true}
    visible={loading}
    accessibilityViewIsModal
    supportedOrientations={['landscape', 'portrait']}
  >
    <View
      accessibilityLabel="Ladevorgang"
      accessibilityRole="alert"
      accessible
      style={styles.modalContainer}
    >
      <LoadingSpinner loading />
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.overlayRgba
  }
});
