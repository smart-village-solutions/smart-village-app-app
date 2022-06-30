import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

import { DOWNLOAD_TYPE } from './downloadType';
import { storageNameCreator } from './storageNameCreator';

// function to delete AR objects downloaded on the device
export const deleteObject = async ({ index, data, setData }) => {
  const { localUris } = data[index];
  let deletedData = [...data];

  for (let i = 0; i < localUris.length; i++) {
    const { downloadUri } = localUris[i];

    const storageName = storageNameCreator({
      dataItem: data[index],
      objectItem: localUris[i]
    });

    try {
      await FileSystem.deleteAsync(downloadUri);
      await AsyncStorage.removeItem(storageName);
    } catch (e) {
      console.error(e);
    }
  }

  deletedData[index].DOWNLOAD_TYPE = DOWNLOAD_TYPE.DOWNLOADABLE;
  deletedData[index].localUris = [];
  deletedData[index].progress = 0;
  deletedData[index].progressSize = 0;
  deletedData[index].size = 0;

  setData(deletedData);
};
