import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

import { colors, consts, device, Icon, normalize, texts } from '../../config';
import { DOWNLOAD_TYPE, formatSize } from '../../helpers';
import { Modal } from '../Modal';
import { BoldText, RegularText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';

import { ARObjectList } from './ARObjectList';

export const ARModal = ({ isListView, isModalVisible, item, onModalVisible, showTitle }) => {
  const { DOWNLOAD_TYPE: itemDownloadType, progress, progressSize, size, title, totalSize } = item;
  const a11yText = consts.a11yLabel;

  return (
    <Modal
      isListView={isListView}
      onModalVisible={onModalVisible}
      isVisible={isModalVisible}
      modalHiddenButtonName={
        itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED && !isListView
          ? texts.settingsTitles.arListLayouts.continue
          : texts.settingsTitles.arListLayouts.cancel
      }
    >
      {showTitle && (
        <>
          <TitleContainer>
            <Title
              accessibilityLabel={`(${texts.settingsTitles.arListLayouts.arListTitle}) ${a11yText.heading}`}
            >
              {texts.settingsTitles.arListLayouts.arListTitle}
            </Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
        </>
      )}

      {isListView ? (
        <ARObjectList showDownloadAllButton showDeleteAllButton showFreeSpace />
      ) : (
        <View>
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
  progressTextStyle: {
    marginLeft: normalize(10)
  },
  upContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

ARModal.propTypes = {
  isListView: PropTypes.bool,
  isModalVisible: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  onModalVisible: PropTypes.func.isRequired,
  showTitle: PropTypes.bool
};
