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

export const ARObjectListItem = ({ data, index, item, navigation, setData, showOnDetailPage }) => {
  const {
    payload: { downloadType, progressSize, totalSize, locationInfo },
    title
  } = item;

  const onPress = async () => {
    if (showOnDetailPage) {
      navigation.navigate(ScreenName.ArtworkDetail, { data, index });
      return;
    }

    if (downloadType === DOWNLOAD_TYPE.DOWNLOADABLE) {
      await downloadObject({ index, data, setData });
    } else if (downloadType === DOWNLOAD_TYPE.DOWNLOADED) {
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
              await deleteObject({ index, data, setData });
            },
            style: 'destructive'
          }
        ]
      );
    }
  };

  return (
    <ListItem
      bottomDivider
      containerStyle={styles.container}
      onPress={onPress}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`(${title}) ${consts.a11yLabel.button}`}
    >
      <ListItem.Content>
        <RegularText small>{title}</RegularText>
        <RegularText smallest>
          {showOnDetailPage ? locationInfo : progressSizeGenerator(progressSize, totalSize)}
        </RegularText>
      </ListItem.Content>

      <IconForDownloadType
        isListView
        downloadType={downloadType}
        showOnDetailPage={showOnDetailPage}
      />
    </ListItem>
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
  showOnDetailPage: PropTypes.bool
};
