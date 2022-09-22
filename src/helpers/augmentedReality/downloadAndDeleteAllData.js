import { readFromStore } from '../storageHelper';

import { deleteObject } from './deleteObject';
import { downloadObject } from './downloadObject';
import { storageNameCreator } from './storageNameCreator';

// function to download all AR objects using `downloadObject`
export const downloadAllData = async ({ data, setData }) => {
  for (const [index, dataItem] of data.entries()) {
    for (const objectItem of dataItem?.payload?.downloadableUris) {
      const { storageName } = storageNameCreator({ dataItem, objectItem });

      try {
        const downloadedItem = await readFromStore(storageName);

        if (!downloadedItem) {
          await downloadObject({ index, data, setData });
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
};

// function to delete all AR objects using `deleteObject`
export const deleteAllData = async ({ data, setData }) => {
  for (let index = 0; index < data.length; index++) {
    await deleteObject({ index, data, setData });
  }
};
