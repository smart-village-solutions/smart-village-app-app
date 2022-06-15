import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DOWNLOAD_TYPE } from './downloadType';
export const downloadObject = async ({ item, index, downloadableData, setDownloadableData }) => {
  const { id: objectId, downloadableUris } = item;
  let newDownloadedData = [...downloadableData];

  for (let itemIndex = 0; itemIndex < downloadableUris.length; itemIndex++) {
    const { downloadUri, title, type, id } = downloadableUris[itemIndex];
    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUri,
      FileSystem.cacheDirectory + `${objectId}-${title}${id}.${type}`,
      {},
      (downloadProgress) => callback(downloadProgress, index, downloadableData, setDownloadableData)
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

      await AsyncStorage.setItem(
        `${objectId}-${title}${id}.${type}`,
        JSON.stringify(newDownloadedData[index])
      );
    } catch (e) {
      console.error(e);
    }
  }

  return { newDownloadedData };
};

const callback = (downloadProgress, index, download, setDownload) => {
  let newArr = [...download];
  const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;

  newArr[index].DOWNLOAD_TYPE = DOWNLOAD_TYPE.DOWNLOADING;
  newArr[index].progressSize = downloadProgress.totalBytesWritten;
  newArr[index].progress = progress;

  setDownload(newArr);
};
