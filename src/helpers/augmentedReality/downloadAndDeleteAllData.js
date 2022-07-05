import { readFromStore } from '../storageHelper';

import { deleteObject } from './deleteObject';
import { downloadObject } from './downloadObject';
import { storageNameCreator } from './storageNameCreator';

// function to download all AR objects using `downloadObject`
export const downloadAllData = async ({ data, setData }) => {
  for (const dataItem of data) {
    const { downloadableUris } = dataItem;

    for (const objectItem of downloadableUris) {
      const storageName = storageNameCreator({
        dataItem,
        objectItem
      });

      try {
        const downloadedItem = await readFromStore(storageName);

        if (!downloadedItem) {
          await downloadObject({
            index: data.indexOf(dataItem),
            data,
            setData
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
};

// function to delete all AR objects using `deleteObject`
export const deleteAllData = async ({ data, setData }) => {
  for (const dataItem of data) {
    await deleteObject({
      index: data.indexOf(dataItem),
      data,
      setData
    });
  }
};
