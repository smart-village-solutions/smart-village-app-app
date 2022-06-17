import { readFromStore } from '../storageHelper';

import { deleteObject } from './deleteObject';
import { downloadObject } from './downloadObject';
import { storageNameCreator } from './storageNameCreator';

// function to download all AR objects using `downloadObject`
export const downloadAllData = async ({ downloadableData, setDownloadableData }) => {
  let allData = [...downloadableData];

  for (let index = 0; index < allData.length; index++) {
    const downloadableDataItem = allData[index];
    const { downloadableUris } = downloadableDataItem;

    for (let itemIndex = 0; itemIndex < downloadableUris.length; itemIndex++) {
      const storageName = storageNameCreator({
        downloadableDataItem: downloadableData[index],
        objectItem: downloadableUris[itemIndex]
      });

      try {
        const downloadedItem = await readFromStore(storageName);

        if (!downloadedItem) {
          const { newDownloadedData } = await downloadObject({
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

// function to delete all AR objects using `deleteObject`
export const deleteAllData = async ({ downloadableData, setDownloadableData }) => {
  let allData = [...downloadableData];

  for (let index = 0; index < allData.length; index++) {
    const { newDownloadedData } = await deleteObject({
      index,
      downloadableData: allData
    });

    setDownloadableData(newDownloadedData);
  }
};
