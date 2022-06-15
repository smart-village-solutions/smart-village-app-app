import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, Icon, normalize, texts } from '../config';
import { deleteObject, downloadObject, DOWNLOAD_TYPE, formatSize } from '../helpers';

import { RegularText } from './Text';
import { Touchable } from './Touchable';

const BUTTON_SIZE = normalize(16);

export const ARDownloadListItem = ({ item, index, data, setData }) => {
  const { DOWNLOAD_TYPE: itemDownloadType, progressSize, size, title, totalSize } = item;

  const onPress = async () => {
    if (itemDownloadType === DOWNLOAD_TYPE.DOWNLOADABLE) {
      const { newDownloadedData } = await downloadObject({
        item,
        index,
        downloadableData: data,
        setDownloadableData: setData
      });
      setData(newDownloadedData);
    } else if (itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED) {
      Alert.alert(
        texts.settingsTitles.arListLayouts.alertTitle,
        texts.settingsTitles.arListLayouts.deleteAlertMessage,
        [
          {
            text: texts.settingsTitles.arListLayouts.cancel,
            style: 'cancel'
          },
          {
            text: texts.settingsTitles.arListLayouts.deleteAlertButtonText,
            onPress: async () => {
              const { newDownloadedData } = await deleteObject({
                item,
                index,
                downloadableData: data
              });
              setData(newDownloadedData);
            },
            style: 'destructive'
          }
        ]
      );
    } else {
      return;
    }
  };

  return (
    <ListItem
      title={<RegularText small>{title}</RegularText>}
      subtitle={() => subtitleRender({ totalSize, size, progressSize })}
      bottomDivider
      containerStyle={styles.container}
      rightIcon={() =>
        itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED ? (
          <Icon.CloseCircle color={colors.darkText} size={BUTTON_SIZE} />
        ) : itemDownloadType === DOWNLOAD_TYPE.DOWNLOADABLE ? (
          <Icon.ArrowDownCircle color={colors.primary} size={BUTTON_SIZE} />
        ) : (
          <ActivityIndicator size="small" />
        )
      }
      onPress={onPress}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`(${title}) ${consts.a11yLabel.button}`}
    />
  );
};

const subtitleRender = ({ totalSize, size, progressSize }) => {
  return progressSize ? (
    <RegularText smallest>{`${
      size >= totalSize ? formatSize(size) : formatSize(progressSize)
    } / ${formatSize(totalSize)}`}</RegularText>
  ) : (
    <RegularText smallest>{`${formatSize(totalSize)}`}</RegularText>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingRight: normalize(18),
    paddingVertical: normalize(12)
  }
});

ARDownloadListItem.propTypes = {
  data: PropTypes.array,
  index: PropTypes.number,
  item: PropTypes.object.isRequired,
  setData: PropTypes.func
};
