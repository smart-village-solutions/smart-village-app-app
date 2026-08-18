import React from 'react';
import { Modal, View } from 'react-native';

import { consts } from '../config';
import { useThemeStyles } from '../hooks/useThemeStyles';

import { LoadingSpinner } from './LoadingSpinner';

export const LoadingModal = ({ loading }: { loading?: boolean }) => {
  const styles = useThemeStyles(createStyles);

  return (
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
};

const createStyles = (colors) => ({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.overlayRgba
  }
});
