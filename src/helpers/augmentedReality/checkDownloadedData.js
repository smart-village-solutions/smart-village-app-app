import { readFromStore } from '../storageHelper';

import { storageNameCreator } from './storageNameCreator';

// function to recognise whether the AR
// object is on the device when the download
// page is opened
export const checkDownloadedData = async ({ data }) => {
  let checkedData = [...data];

  for (let index = 0; index < checkedData.length; index++) {
    const downloadableDataItem = checkedData[index];

    const { downloadableUris } = downloadableDataItem;

    for (let itemIndex = 0; itemIndex < downloadableUris.length; itemIndex++) {
      const storageName = storageNameCreator({
        dataItem: data[index],
        objectItem: downloadableUris[itemIndex]
      });

      try {
        const downloadedItem = await readFromStore(storageName);

        if (downloadedItem) {
          const { localUris } = downloadedItem;

          checkedData[index] = localUris ? downloadedItem : [];
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  return { checkedData };
};
