import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, Icon, normalize, texts } from '../../config';
import { deleteObject, downloadObject, DOWNLOAD_TYPE, progressSizeGenerator } from '../../helpers';
import { ScreenName } from '../../types';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';

export const ARObjectListItem = ({ data, index, item, navigation, setData, showOnDetailPage }) => {
  const {
    DOWNLOAD_TYPE: itemDownloadType,
    progressSize,
    size,
    title,
    totalSize,
    locationInfo
  } = item;

  const onPress = async () => {
    if (showOnDetailPage) {
      navigation.navigate(ScreenName.ArtworkDetail, { data, index });
      return;
    }

    if (itemDownloadType === DOWNLOAD_TYPE.DOWNLOADABLE) {
      await downloadObject({
        index,
        data,
        setData
      });
    } else if (itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED) {
      Alert.alert(
        texts.settingsTitles.arListLayouts.alertTitle,
        texts.settingsTitles.arListLayouts.deleteAlertMessage,
        [
          {
            text: texts.settingsTitles.arListLayouts.deleteAlertButtonText,
            onPress: async () => {
              await deleteObject({
                index,
                data,
                setData
              });
            },
            style: 'destructive'
          },
          {
            text: texts.settingsTitles.arListLayouts.cancel,
            style: 'cancel'
          }
        ]
      );
    }
  };

  return (
    <ListItem
      title={<RegularText small>{title}</RegularText>}
      subtitle={
        <RegularText smallest>
          {showOnDetailPage
            ? locationInfo
            : progressSizeGenerator({ progressSize, size, totalSize })}
        </RegularText>
      }
      bottomDivider
      containerStyle={styles.container}
      rightIcon={() =>
        showOnDetailPage ? (
          <Icon.ArrowRight size={normalize(20)} />
        ) : (
          <IconFor itemDownloadType={itemDownloadType} />
        )
      }
      onPress={onPress}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`(${title}) ${consts.a11yLabel.button}`}
    />
  );
};

const IconFor = ({ itemDownloadType }) => {
  return itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED ? (
    <Icon.CloseCircle color={colors.darkText} size={normalize(16)} />
  ) : itemDownloadType === DOWNLOAD_TYPE.DOWNLOADABLE ? (
    <Icon.ArrowDownCircle color={colors.primary} size={normalize(16)} />
  ) : (
    <ActivityIndicator size="small" color={colors.accent} />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingRight: normalize(18),
    paddingVertical: normalize(12)
  }
});

ARObjectListItem.propTypes = {
  data: PropTypes.array,
  index: PropTypes.number,
  item: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  setData: PropTypes.func,
  showOnDetailPage: PropTypes.bool
};

IconFor.propTypes = {
  itemDownloadType: PropTypes.string.isRequired
};
