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
    [{ text: texts.settingsTitles.arListLayouts.ok }]
  );

// function to delete AR objects downloaded on the device
export const deleteObject = async ({ index, data, setData }) => {
  const deletedData = [...data];
  const dataItem = data[index];

  for (const objectItem of dataItem?.payload?.localUris) {
    const { storageName } = storageNameCreator({ dataItem, objectItem });

    try {
      await FileSystem.deleteAsync(objectItem?.uri);
      await AsyncStorage.removeItem(storageName);

      deletedData[index].payload.downloadType = DOWNLOAD_TYPE.DOWNLOADABLE;
      deletedData[index].payload.localUris = [];
      deletedData[index].payload.progress = 0;
      deletedData[index].payload.progressSize = 0;
      deletedData[index].payload.size = 0;
    } catch (error) {
      console.error(error);

      // return is used to prevent the for loop from continuing
      return deleteErrorAlert();
    }
  }

  setData(deletedData);
};
