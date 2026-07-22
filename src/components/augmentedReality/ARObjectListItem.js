/* eslint-disable react-native/no-inline-styles */
import PropTypes from 'prop-types';
import React from 'react';
import { Alert } from 'react-native';
import { ListItem } from 'react-native-elements';

import { consts, normalize, texts } from '../../config';
import { DOWNLOAD_TYPE, deleteObject, downloadObject, progressSizeGenerator } from '../../helpers';
import { ScreenName } from '../../types';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { useThemeStyles } from '../../hooks/useThemeStyles';

import { IconForDownloadType } from './IconForDownloadType';

export const ARObjectListItem = ({ data, index, item, navigation, setData, showOnDetailPage }) => {
  const styles = useThemeStyles(createStyles);
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
      <ListItem.Content style={{ flexDirection: showOnDetailPage ? 'column-reverse' : 'column' }}>
        <BoldText small>{title}</BoldText>
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

const createStyles = (colors) => ({
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
