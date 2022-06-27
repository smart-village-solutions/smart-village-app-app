import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

import { texts } from '../../config';

import { DOWNLOAD_TYPE } from './downloadType';
import { storageNameCreator } from './storageNameCreator';

const deleteErrorAlert = () =>
  Alert.alert(
    texts.settingsTitles.arListLayouts.alertTitle,
    texts.settingsTitles.arListLayouts.deleteError,
    [{ text: texts.settingsTitles.arListLayouts.ok, style: 'cancel' }]
  );

// function to delete AR objects downloaded on the device
export const deleteObject = async ({ index, downloadableData }) => {
  const { localUris } = downloadableData[index];
  let newDownloadedData = [...downloadableData];

  for (let i = 0; i < localUris.length; i++) {
    const { downloadUri } = localUris[i];

    const storageName = storageNameCreator({
      downloadableDataItem: downloadableData[index],
      objectItem: localUris[i]
    });

    try {
      await FileSystem.deleteAsync(downloadUri);
      await AsyncStorage.removeItem(storageName);
    } catch (error) {
      return deleteErrorAlert();
    }
  }

  newDownloadedData[index].size = 0;
  newDownloadedData[index].progressSize = 0;
  newDownloadedData[index].DOWNLOAD_TYPE = DOWNLOAD_TYPE.DOWNLOADABLE;
  newDownloadedData[index].localUris = [];

  return { newDownloadedData };
};
