import { readFromStore } from '../storageHelper';

import { storageNameCreator } from './storageNameCreator';

// function to recognise whether the AR
// object is on the device when the download
// page is opened
export const checkDownloadedData = async ({ downloadableData }) => {
  let newDownloadedData = [...downloadableData];

  for (let index = 0; index < newDownloadedData.length; index++) {
    const downloadableDataItem = newDownloadedData[index];

    const { downloadableUris } = downloadableDataItem;

    for (let itemIndex = 0; itemIndex < downloadableUris.length; itemIndex++) {
      const storageName = storageNameCreator({
        downloadableDataItem: downloadableData[index],
        objectItem: downloadableUris[itemIndex]
      });

      try {
        const downloadedItem = await readFromStore(storageName);

        if (downloadedItem) {
          const { localUris } = downloadedItem;

          newDownloadedData[index] = localUris ? downloadedItem : [];
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  return { newDownloadedData };
};
