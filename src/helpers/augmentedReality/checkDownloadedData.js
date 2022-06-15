import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkDownloadedData = async ({ downloadableData }) => {
  let newDownloadedData = [...downloadableData];

  for (let index = 0; index < newDownloadedData.length; index++) {
    const downloadableDataItem = newDownloadedData[index];

    const { id: objectId, downloadableUris } = downloadableDataItem;

    for (let itemIndex = 0; itemIndex < downloadableUris.length; itemIndex++) {
      const { id, title, type } = downloadableUris[itemIndex];

      try {
        const downloadedItem = await AsyncStorage.getItem(`${objectId}-${title}${id}.${type}`);

        if (downloadedItem) {
          const { localUris } = JSON.parse(downloadedItem);

          newDownloadedData[index] = localUris && JSON.parse(downloadedItem);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  return { newDownloadedData };
};
