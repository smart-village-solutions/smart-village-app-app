import * as FileSystem from 'expo-file-system';

import { addToStore } from '../storageHelper';

import { DOWNLOAD_TYPE } from './downloadType';
import { storageNameCreator } from './storageNameCreator';

// function for downloading AR objects
export const downloadObject = async ({ index, downloadableData, setDownloadableData }) => {
  const { downloadableUris } = downloadableData[index];
  let newDownloadedData = [...downloadableData];

  for (let itemIndex = 0; itemIndex < downloadableUris.length; itemIndex++) {
    const { downloadUri, title, type, id } = downloadableUris[itemIndex];

    const storageName = storageNameCreator({
      downloadableDataItem: downloadableData[index],
      objectItem: downloadableUris[itemIndex]
    });

    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUri,
      FileSystem.cacheDirectory + storageName,
      {},
      (downloadProgress) =>
        downloadProgressInBytes(downloadProgress, index, downloadableData, setDownloadableData)
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      const { size } = await FileSystem.getInfoAsync(uri);

      newDownloadedData[index].DOWNLOAD_TYPE = DOWNLOAD_TYPE.DOWNLOADED;
      newDownloadedData[index].size += size;
      newDownloadedData[index].localUris.push({
        downloadUri: uri,
        id,
        size,
        title,
        type
      });

      addToStore(storageName, newDownloadedData[index]);
    } catch (e) {
      console.error(e);
    }
  }

  return { newDownloadedData };
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
