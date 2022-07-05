import * as FileSystem from 'expo-file-system';

import { addToStore } from '../storageHelper';

import { DOWNLOAD_TYPE } from './downloadType';
import { storageNameCreator } from './storageNameCreator';

// function for downloading AR objects
export const downloadObject = async ({ index, data, setData }) => {
  const { downloadableUris } = data[index];
  let downloadedData = [...data];

  for (const objectItem of downloadableUris) {
    const { downloadUri, title, type, id } = objectItem;

    const storageName = storageNameCreator({
      dataItem: data[index],
      objectItem
    });

    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUri,
      FileSystem.cacheDirectory + storageName,
      {},
      (downloadProgress) =>
        downloadProgressInBytes(downloadProgress, index, downloadedData, setData)
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      const { size } = await FileSystem.getInfoAsync(uri);

      downloadedData[index].DOWNLOAD_TYPE = DOWNLOAD_TYPE.DOWNLOADED;
      downloadedData[index].size += size;
      downloadedData[index].localUris.push({
        downloadUri: uri,
        id,
        size,
        title,
        type
      });

      addToStore(storageName, downloadedData[index]);
    } catch (e) {
      console.error(e);
    }
  }

  setData(downloadedData);
};

/**
 * callback function that allows us to see how many
 * bytes per second the file is downloaded
 *
 * @param {object} downloadProgress the object that holds the total size of the object
 *                                  returned by the `createDownloadResumable` function
 *                                  and how much was downloaded to the device
 * @param {number} index            the index information of the downloaded object in `JSON`
 * @param {array} downloadedData    `JSON` array containing the objects to be downloaded
 * @param {function} setData        state function that allows us to re-render the image on
 *                                  the screen to show the download size
 */
const downloadProgressInBytes = (downloadProgress, index, downloadedData, setData) => {
  downloadedData[index].DOWNLOAD_TYPE = DOWNLOAD_TYPE.DOWNLOADING;
  downloadedData[index].progressSize =
    downloadedData[index].size + downloadProgress.totalBytesWritten;
  downloadedData[index].progress =
    downloadedData[index].progressSize / downloadedData[index].totalSize;

  setData([...downloadedData]);
};
