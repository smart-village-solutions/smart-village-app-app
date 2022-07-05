import { readFromStore } from '../storageHelper';

import { DOWNLOAD_TYPE } from './downloadType';
import { storageNameCreator } from './storageNameCreator';

// function to recognise whether the AR object is on the device when the download page is opened
export const checkDownloadedData = async ({ data, setData }) => {
  let checkedData = [...data];

  for (let index = 0; index < checkedData.length; index++) {
    const { downloadableUris } = checkedData[index];

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
        } else {
          checkedData[index].DOWNLOAD_TYPE = DOWNLOAD_TYPE.DOWNLOADABLE;
          checkedData[index].localUris = [];
          checkedData[index].progress = 0;
          checkedData[index].progressSize = 0;
          checkedData[index].size = 0;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  setData(checkedData);
};
