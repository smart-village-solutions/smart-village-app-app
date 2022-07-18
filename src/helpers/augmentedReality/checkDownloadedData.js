import { readFromStore } from '../storageHelper';

import { DOWNLOAD_TYPE } from './downloadType';
import { storageNameCreator } from './storageNameCreator';

// function to recognise whether the AR object is on the device when the download page is opened
export const checkDownloadedData = async ({ data, setData }) => {
  const checkedData = [...data];

  for (const [index, dataItem] of checkedData.entries()) {
    for (const objectItem of dataItem?.downloadableUris) {
      const { storageName } = storageNameCreator({ dataItem, objectItem });

      try {
        const downloadedItem = await readFromStore(storageName);

        if (downloadedItem?.localUris) {
          checkedData[index] = downloadedItem;
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
