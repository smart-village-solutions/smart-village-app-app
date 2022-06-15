import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, device, normalize, texts } from '../../config';
import {
  checkDownloadedData,
  deleteAllData,
  downloadAllData,
  dummyData,
  formatSize
} from '../../helpers';
import { ARDownloadListItem } from '../ARDownloadListItem';
import { Button } from '../Button';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow } from '../Wrapper';

const downloadAllDataAlert = (downloadAll) =>
  Alert.alert(
    texts.settingsTitles.arListLayouts.alertTitle,
    texts.settingsTitles.arListLayouts.allDownloadAlertMessage,
    [
      {
        text: texts.settingsTitles.arListLayouts.downloadAlertButtonText,
        onPress: downloadAll,
        style: 'default'
      },
      { text: texts.settingsTitles.arListLayouts.cancel, style: 'cancel' }
    ]
  );

const deleteAllDataAlert = (deleteAll) =>
  Alert.alert(
    texts.settingsTitles.arListLayouts.alertTitle,
    texts.settingsTitles.arListLayouts.allDeleteAlertMessage,
    [
      {
        text: texts.settingsTitles.arListLayouts.deleteAlertButtonText,
        onPress: deleteAll,
        style: 'destructive'
      },
      { text: texts.settingsTitles.arListLayouts.cancel, style: 'cancel' }
    ]
  );

const renderItem = ({ data, index, item, setData }) => (
  <ARDownloadListItem item={item} index={index} data={data} setData={setData} />
);

export const ARDownloadList = () => {
  const [data, setData] = useState(dummyData);
  const [loading, setLoading] = useState(false);
  const [freeSize, setFreeSize] = useState(0);

  useEffect(() => {
    checkFreeStorage();
  }, [data]);

  useEffect(() => {
    checkinData();
  }, []);

  const checkinData = async () => {
    setLoading(false);
    const { newDownloadedData } = await checkDownloadedData({ downloadableData: data });
    setData(newDownloadedData);
    setLoading(false);
  };

  const checkFreeStorage = async () => {
    const storage = await FileSystem.getFreeDiskStorageAsync();
    setFreeSize(formatSize(storage));
  };

  const downloadAll = async () => {
    downloadAllData({ downloadableData: data, setDownloadableData: setData });
  };

  const deleteAll = async () => {
    deleteAllData({ downloadableData: data, setDownloadableData: setData });
  };

  if (loading) return <ActivityIndicator size="small" />;

  return (
    <>
      <Wrapper style={styles.wrapper}>
        <WrapperRow spaceBetween>
          <BoldText>{texts.settingsTitles.arListLayouts.arListTitle}</BoldText>
        </WrapperRow>
      </Wrapper>

      <Divider style={styles.divider} />

      <FlatList
        data={data}
        renderItem={({ item, index }) => renderItem({ data, index, item, setData })}
        keyExtractor={(item) => item.id}
      />

      <Wrapper>
        <Button
          invert
          title={texts.settingsTitles.arListLayouts.allDownloadButtonTitle}
          onPress={() => downloadAllDataAlert(downloadAll)}
        />
        <Touchable style={styles.touchableStyle} onPress={() => deleteAllDataAlert(deleteAll)}>
          <RegularText small primary underline>
            {texts.settingsTitles.arListLayouts.allDeleteButtonTitle}
          </RegularText>
        </Touchable>
        <RegularText smallest center>
          {`${texts.settingsTitles.arListLayouts.freeMemoryPlace}${freeSize}`}
        </RegularText>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.placeholder
  },
  touchableStyle: {
    alignSelf: 'center'
  },
  wrapper: {
    paddingBottom: device.platform === 'ios' ? normalize(16) : normalize(14),
    paddingTop: device.platform === 'ios' ? normalize(16) : normalize(18)
  }
});
