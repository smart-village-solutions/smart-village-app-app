import PropTypes from 'prop-types';
import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, normalize, texts } from '../../config';
import { deleteObject, downloadObject, DOWNLOAD_TYPE, progressSizeGenerator } from '../../helpers';
import { ScreenName } from '../../types';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';

import { IconForDownloadType } from './IconForDownloadType';

export const ARObjectListItem = ({
  setListItemDownloadType,
  data,
  index,
  item,
  navigation,
  setData,
  showOnDetailPage
}) => {
  const { DOWNLOAD_TYPE: itemDownloadType, progressSize, title, totalSize, locationInfo } = item;

  const onPress = async () => {
    if (showOnDetailPage) {
      navigation.navigate(ScreenName.ArtworkDetail, { data, index });
      return;
    }

    if (itemDownloadType === DOWNLOAD_TYPE.DOWNLOADABLE) {
      setListItemDownloadType(DOWNLOAD_TYPE.DOWNLOADING);

      await downloadObject({ index, data, setData });

      setListItemDownloadType(DOWNLOAD_TYPE.DOWNLOADED);
    } else if (itemDownloadType === DOWNLOAD_TYPE.DOWNLOADED) {
      Alert.alert(
        texts.settingsTitles.arListLayouts.alertTitle,
        texts.settingsTitles.arListLayouts.deleteAlertMessage,
        [
          {
            text: texts.settingsTitles.arListLayouts.deleteAlertButtonText,
            onPress: async () => {
              await deleteObject({ index, data, setData });
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
          {showOnDetailPage ? locationInfo : progressSizeGenerator(progressSize, totalSize)}
        </RegularText>
      }
      bottomDivider
      containerStyle={styles.container}
      rightIcon={
        <IconForDownloadType
          isListView
          itemDownloadType={itemDownloadType}
          showOnDetailPage={showOnDetailPage}
        />
      }
      onPress={onPress}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`(${title}) ${consts.a11yLabel.button}`}
    />
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
  setData: PropTypes.func,
  index: PropTypes.number,
  item: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  setListItemDownloadType: PropTypes.func,
  showOnDetailPage: PropTypes.bool
};
