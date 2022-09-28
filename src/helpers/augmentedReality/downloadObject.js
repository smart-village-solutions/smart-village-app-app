import * as FileSystem from 'expo-file-system';

import { addToStore } from '../storageHelper';

import { DOWNLOAD_TYPE } from './downloadType';
import { storageNameCreator } from './storageNameCreator';

// function for downloading AR objects
export const downloadObject = async ({ index, data, setData }) => {
  const downloadedData = [...data];
  const dataItem = data[index];

  for (const objectItem of dataItem?.payload?.downloadableUris) {
    const {
      chromaKeyFilteredVideo,
      id,
      isSpatialSound,
      maxDistance,
      minDistance,
      physicalWidth,
      position,
      rolloffModel,
      rotation,
      scale,
      title,
      type,
      uri
    } = objectItem;

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

      const fileSystemDownload = await downloadResumable.downloadAsync();
      const { size } = await FileSystem.getInfoAsync(fileSystemDownload.uri);

      downloadedData[index].payload.downloadType = DOWNLOAD_TYPE.DOWNLOADED;
      downloadedData[index].payload.size += size;
      downloadedData[index].payload.localUris?.push({
        chromaKeyFilteredVideo, // HEX Color Code
        id,
        isSpatialSound, // Boolean
        maxDistance: parseFloat(maxDistance),
        minDistance: parseFloat(minDistance),
        physicalWidth: parseFloat(physicalWidth),
        position, // Array [x,y,z]
        rolloffModel, // String (none, linear, or logarithmic)
        rotation, // Array [x,y,z]
        scale, // Array [x,y,z]
        size,
        title,
        type,
        uri: fileSystemDownload.uri
      });

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
  downloadedData[index].payload.downloadType = DOWNLOAD_TYPE.DOWNLOADING;
  downloadedData[index].payload.progressSize =
    downloadedData[index].payload.size + progress.totalBytesWritten;
  downloadedData[index].payload.progress =
    downloadedData[index].payload.progressSize / downloadedData[index].payload.totalSize;

  // we create a copy of the array to make the set state method aware of "there is something new"
  // that should be rendered
  setData([...downloadedData]);
};
