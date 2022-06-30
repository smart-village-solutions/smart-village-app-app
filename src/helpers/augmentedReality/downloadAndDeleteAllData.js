import { readFromStore } from '../storageHelper';

import { deleteObject } from './deleteObject';
import { downloadObject } from './downloadObject';
import { storageNameCreator } from './storageNameCreator';

// function to download all AR objects using `downloadObject`
export const downloadAllData = async ({ data, setData }) => {
  let allData = [...data];

  for (let index = 0; index < allData.length; index++) {
    const downloadableDataItem = allData[index];
    const { downloadableUris } = downloadableDataItem;

    for (let itemIndex = 0; itemIndex < downloadableUris.length; itemIndex++) {
      const storageName = storageNameCreator({
        dataItem: data[index],
        objectItem: downloadableUris[itemIndex]
      });

      try {
        const downloadedItem = await readFromStore(storageName);

        if (!downloadedItem) {
          await downloadObject({
            index,
            data: allData,
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
  let allData = [...data];

  for (let index = 0; index < allData.length; index++) {
    await deleteObject({
      index,
      data: allData,
      setData
    });
  }
};
