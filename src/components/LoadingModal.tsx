import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { colors, consts } from '../config';

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
      accessibilityLabel={consts.a11yLabel.loadingModal}
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
