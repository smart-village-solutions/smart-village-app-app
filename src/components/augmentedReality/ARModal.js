import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

import { colors, normalize, texts } from '../../config';
import { DOWNLOAD_TYPE, progressSizeGenerator } from '../../helpers';
import { Modal } from '../Modal';
import { BoldText, RegularText } from '../Text';

import { ARObjectList } from './ARObjectList';
import { IconForDownloadType } from './IconForDownloadType';

export const ARModal = ({ isListView, isModalVisible, item, onModalVisible, showTitle }) => {
  const { DOWNLOAD_TYPE: itemDownloadType, progress, progressSize, title, totalSize } = item;

  return (
    <Modal
      isListView={isListView}
      onModalVisible={onModalVisible}
      isVisible={isModalVisible}
      modalHiddenButtonName={
        itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED && !isListView
          ? texts.settingsTitles.arListLayouts.continue
          : texts.settingsTitles.arListLayouts.hide
      }
    >
      {isListView ? (
        <ARObjectList
          showDownloadAllButton
          showDeleteAllButton
          showFreeSpace
          showTitle={showTitle}
        />
      ) : (
        <View>
          <View style={[styles.container, styles.iconAndByteText]}>
            <IconForDownloadType itemDownloadType={itemDownloadType} />

            <RegularText small style={styles.progressTextStyle}>
              {progressSizeGenerator(progressSize, totalSize)}
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
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: normalize(20)
  },
  iconAndByteText: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  progressTextStyle: {
    marginLeft: normalize(10)
  }
});

ARModal.propTypes = {
  isListView: PropTypes.bool,
  isModalVisible: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  onModalVisible: PropTypes.func.isRequired,
  showTitle: PropTypes.bool
};
