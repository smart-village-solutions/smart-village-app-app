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
  setData,
  isLoading,
  refetch,
  isListView,
  isModalVisible,
  setIsModalVisible,
  item,
  onModalVisible,
  showTitle
}) => {
  const defaultItem = {
    DOWNLOAD_TYPE: DOWNLOAD_TYPE.DOWNLOADABLE,
    progress: 0,
    progressSize: 0,
    size: 0,
    title: '',
    totalSize: 0
  };
  const { DOWNLOAD_TYPE: itemDownloadType, progress, progressSize, title, totalSize } =
    item || defaultItem;

  // TODO: if isListView == true we will have multiple items with maybe different download types
  //       depending on the download type we can than decide which onModalVisible we want to trigger

  return (
    <Modal
      isListView={isListView}
      onModalVisible={() => {
        if (onModalVisible) {
          onModalVisible();
          return;
        }

        if (itemDownloadType === DOWNLOAD_TYPE.DOWNLOADING) {
          HiddenModalAlert({ onPress: () => setIsModalVisible(!isModalVisible) });
          return;
        }

        setIsModalVisible(!isModalVisible);
      }}
      isVisible={isModalVisible}
      modalHiddenButtonName={
        itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED && !isListView
          ? texts.settingsTitles.arListLayouts.continue
          : texts.settingsTitles.arListLayouts.hide
      }
    >
      {isListView ? (
        <ARObjectList
          data={data}
          setData={setData}
          isLoading={isLoading}
          refetch={refetch}
          showDeleteAllButton
          showDownloadAllButton
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
  data: PropTypes.array,
  setData: PropTypes.func,
  isListView: PropTypes.bool,
  isLoading: PropTypes.bool,
  isModalVisible: PropTypes.bool.isRequired,
  setIsModalVisible: PropTypes.func,
  item: PropTypes.object,
  onModalVisible: PropTypes.func,
  refetch: PropTypes.func,
  showTitle: PropTypes.bool
};
