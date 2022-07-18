import * as FileSystem from 'expo-file-system';

import { addToStore } from '../storageHelper';

import { DOWNLOAD_TYPE } from './downloadType';
import { storageNameCreator } from './storageNameCreator';

// function for downloading AR objects
export const downloadObject = async ({ index, data, setData }) => {
  const downloadedData = [...data];
  const dataItem = data[index];

  for (const objectItem of dataItem?.downloadableUris) {
    const { uri, title, type, id } = objectItem;

    const { directoryName, folderName, storageName } = storageNameCreator({ dataItem, objectItem });

    const downloadResumable = FileSystem.createDownloadResumable(
      uri,
      directoryName,
      {},
      (progress) => downloadProgressInBytes(progress, index, downloadedData, setData)
    );

    try {
      /*
      in order to load the textures properly, it is necessary to create a different folder for 
      each object. Saving all objects in the same folder with a specific name is important for 
      the display of the 3D object. If the folder does not exist at the time of downloading the 
      object, this folder must be created on the device before downloading.
      */
      const dirInfo = await FileSystem.getInfoAsync(folderName);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(folderName, { intermediates: true });
      }

      const { uri } = await downloadResumable.downloadAsync();
      const { size } = await FileSystem.getInfoAsync(uri);

      downloadedData[index].DOWNLOAD_TYPE = DOWNLOAD_TYPE.DOWNLOADED;
      downloadedData[index].size += size;
      downloadedData[index].localUris.push({ uri, id, size, title, type });

      addToStore(storageName, downloadedData[index]);
    } catch (e) {
      console.error(e);
    }
  }

  setData(downloadedData);
};

/**
 * callback function that allows us to see how many bytes per second the file is downloaded
 *
 * @param {object} progress         the object that holds the total size of the object
 *                                  returned by the `createDownloadResumable` function
 *                                  and how much was downloaded to the device
 * @param {number} index            the index information of the downloaded object in `JSON`
 * @param {array} downloadedData    `JSON` array containing the objects to be downloaded
 * @param {function} setData        state function that allows us to re-render the image on
 *                                  the screen to show the download size
 */
const downloadProgressInBytes = (progress, index, downloadedData, setData) => {
  downloadedData[index].DOWNLOAD_TYPE = DOWNLOAD_TYPE.DOWNLOADING;
  downloadedData[index].progressSize = downloadedData[index].size + progress.totalBytesWritten;
  downloadedData[index].progress =
    downloadedData[index].progressSize / downloadedData[index].totalSize;

  // we create a copy of the array to make the set state method aware of "there is something new"
  // that should be rendered
  setData([...downloadedData]);
};
