import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

import { colors, Icon, normalize, texts } from '../../config';
import { DOWNLOAD_TYPE, formatSize } from '../../helpers';
import { Modal } from '../Modal';
import { BoldText, RegularText } from '../Text';

export const ARModal = ({ isModalVisible, item, onModalVisible }) => {
  const { DOWNLOAD_TYPE: itemDownloadType, progress, progressSize, size, title, totalSize } = item;

  return (
    <Modal
      onModalVisible={onModalVisible}
      isVisible={isModalVisible}
      modalHiddenButtonName={
        itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED
          ? texts.settingsTitles.arListLayouts.continue
          : texts.settingsTitles.arListLayouts.cancel
      }
    >
      <View style={[styles.container, styles.upContainer]}>
        {itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED ? (
          <Icon.Check color={colors.primary} size={normalize(20)} />
        ) : (
          <ActivityIndicator size="small" color={colors.accent} />
        )}

        <RegularText small style={styles.progressTextStyle}>
          {`${size >= totalSize ? formatSize(size) : formatSize(progressSize)} / ${formatSize(
            totalSize
          )}`}
        </RegularText>
      </View>

      <View style={styles.container}>
        <BoldText>{title}</BoldText>
        <ProgressBar
          borderColor={colors.surface}
          color={colors.primary}
          height={3}
          progress={progress}
          unfilledColor={colors.gray20}
          width={null}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: normalize(20)
  },
  progressTextStyle: {
    marginLeft: normalize(10)
  },
  upContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

ARModal.propTypes = {
  isModalVisible: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  onModalVisible: PropTypes.func.isRequired
};
