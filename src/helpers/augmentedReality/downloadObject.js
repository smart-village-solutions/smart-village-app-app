import * as FileSystem from 'expo-file-system';

import { addToStore } from '../storageHelper';

import { DOWNLOAD_TYPE } from './downloadType';
import { storageNameCreator } from './storageNameCreator';

// function for downloading AR objects
export const downloadObject = async ({ index, data, setData }) => {
  const { downloadableUris } = data[index];
  let downloadedData = [...data];

  for (let itemIndex = 0; itemIndex < downloadableUris.length; itemIndex++) {
    const { downloadUri, title, type, id } = downloadableUris[itemIndex];

    const storageName = storageNameCreator({
      dataItem: data[index],
      objectItem: downloadableUris[itemIndex]
    });

    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUri,
      FileSystem.cacheDirectory + storageName,
      {},
      (downloadProgress) => downloadProgressInBytes(downloadProgress, index, data, setData)
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

  return { downloadedData };
};

// callback function that allows us to see how many
// bytes per second the file is downloaded
const downloadProgressInBytes = (
  downloadProgress,
  index,
  downloadableData,
  setDownloadableData
) => {
  let newArr = [...downloadableData];
  const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;

  newArr[index].DOWNLOAD_TYPE = DOWNLOAD_TYPE.DOWNLOADING;
  newArr[index].progressSize = downloadProgress.totalBytesWritten;
  newArr[index].progress = progress;

  setDownloadableData(newArr);
};
