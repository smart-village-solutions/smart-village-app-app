import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

import { colors, normalize, texts } from '../../config';
import { DOWNLOAD_TYPE, progressSizeGenerator } from '../../helpers';
import { Modal } from '../Modal';
import { BoldText, RegularText } from '../Text';

import { ARObjectList } from './ARObjectList';
import { HiddenModalAlert } from './HiddenModalAlert';
import { IconForDownloadType } from './IconForDownloadType';

export const ARModal = ({
  data,
  index,
  setData,
  isListView,
  isLoading,
  isModalVisible,
  setIsModalVisible,
  onModalVisible,
  showTitle
}) => {
  // this modal is called for file package lists and for single file packages, where we need the
  // explicit object at the given `index`. the `index` is only given if we do not have a
  // truthy `isListView`, thats why we need to "secure" the destructing with `{}`.
  const { downloadType, progress, progressSize, totalSize } = data?.[index]?.payload || {};

  const { title } = data?.[index] || {};

  // if a download is running, we want to show the users an additional alert to inform about
  // difficulties with hiding the modal.
  const showHiddenAlert = data?.some(
    (item) => item?.payload?.downloadType === DOWNLOAD_TYPE.DOWNLOADING
  );

  // in modals for single files we can have two states of the modal button and not only "hide",
  // because we want to navigate directly in case the file package is downloaded instead of hiding
  // the modal manually and then pressing a button to navigate.
  const modalHiddenButtonName =
    downloadType === DOWNLOAD_TYPE.DOWNLOADED && !isListView
      ? texts.settingsTitles.arListLayouts.continue
      : texts.settingsTitles.arListLayouts.hide;

  return (
    <Modal
      isListView={isListView}
      height={isListView && '85%'}
      onModalVisible={() => {
        if (onModalVisible) {
          onModalVisible();
          return;
        }

        if (showHiddenAlert) {
          HiddenModalAlert({ onPress: () => setIsModalVisible(!isModalVisible) });
          return;
        }

        setIsModalVisible(!isModalVisible);
      }}
      isVisible={isModalVisible}
      modalHiddenButtonName={modalHiddenButtonName}
    >
      {isListView ? (
        <ARObjectList
          data={data}
          setData={setData}
          isLoading={isLoading}
          showDeleteAllButton
          showDownloadAllButton
          showFreeSpace
          showTitle={showTitle}
        />
      ) : (
        <View>
          <View style={[styles.container, styles.iconAndByteText]}>
            <IconForDownloadType downloadType={downloadType} />

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
    marginBottom: normalize(20),
    width: '100%'
  },
  iconAndByteText: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  progressTextStyle: {
    marginLeft: normalize(10)
  }
});

ARModal.propTypes = {
  data: PropTypes.array,
  index: PropTypes.number,
  setData: PropTypes.func,
  isListView: PropTypes.bool,
  isLoading: PropTypes.bool,
  isModalVisible: PropTypes.bool.isRequired,
  setIsModalVisible: PropTypes.func,
  onModalVisible: PropTypes.func,
  showTitle: PropTypes.bool
};
