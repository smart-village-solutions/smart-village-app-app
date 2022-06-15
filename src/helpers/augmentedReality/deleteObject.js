import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

import { DOWNLOAD_TYPE } from './downloadType';

export const deleteObject = async ({ item, index, downloadableData }) => {
  const { localUris, id: objectId } = item;
  let newDownloadedData = [...downloadableData];

  for (let i = 0; i < localUris.length; i++) {
    const { downloadUri, title, type, id } = localUris[i];

    try {
      await FileSystem.deleteAsync(downloadUri);
      await AsyncStorage.removeItem(`${objectId}-${title}${id}.${type}`);
    } catch (e) {
      console.error(e);
    }
  }

  newDownloadedData[index].size = 0;
  newDownloadedData[index].progressSize = 0;
  newDownloadedData[index].DOWNLOAD_TYPE = DOWNLOAD_TYPE.DOWNLOADABLE;
  newDownloadedData[index].localUris = [];

  return { newDownloadedData };
};
