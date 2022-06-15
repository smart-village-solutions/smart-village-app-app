import AsyncStorage from '@react-native-async-storage/async-storage';

import { deleteObject } from './deleteObject';
import { downloadObject } from './downloadObject';

export const downloadAllData = async ({ downloadableData, setDownloadableData }) => {
  let allData = [...downloadableData];

  for (let index = 0; index < allData.length; index++) {
    const downloadableDataItem = allData[index];
    const { id: objectId, downloadableUris } = downloadableDataItem;

    for (let itemIndex = 0; itemIndex < downloadableUris.length; itemIndex++) {
      const { id, title, type } = downloadableUris[itemIndex];

      try {
        const downloadedItem = await AsyncStorage.getItem(`${objectId}-${title}${id}.${type}`);

        if (!downloadedItem) {
          const { newDownloadedData } = await downloadObject({
            item: downloadableDataItem,
            index,
            downloadableData: allData,
            setDownloadableData
          });

          setDownloadableData(newDownloadedData);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
};

export const deleteAllData = async ({ downloadableData, setDownloadableData }) => {
  let allData = [...downloadableData];

  for (let index = 0; index < allData.length; index++) {
    const downloadableDataItem = allData[index];
    const { newDownloadedData } = await deleteObject({
      item: downloadableDataItem,
      index,
      downloadableData: allData
    });

    setDownloadableData(newDownloadedData);
  }
};
