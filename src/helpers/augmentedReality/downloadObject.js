import * as FileSystem from 'expo-file-system/legacy';

import { addToStore } from '../storageHelper';

import { DOWNLOAD_TYPE } from './downloadType';
import { storageNameCreator } from './storageNameCreator';

// function for downloading AR objects
/* eslint-disable complexity */
export const downloadObject = async ({ index, data, setData }) => {
  const dataItem = data?.[index];
  if (!dataItem?.payload?.scenes?.length) return;

  const totalDownloads = (dataItem.payload.scenes ?? []).reduce(
    (acc, s) => acc + (s?.downloadableUris ?? []).length,
    0
  );

  const alreadyLocalCount = (dataItem.payload.scenes ?? []).reduce(
    (acc, s) => acc + (s?.localUris ?? []).length,
    0
  );

  const initialPending = Math.max(totalDownloads - alreadyLocalCount, 0);

  setData((prev) =>
    (prev ?? []).map((item, i) => {
      if (i !== index) return item;
      const payload = item?.payload ?? {};
      return {
        ...item,
        payload: {
          ...payload,
          totalDownloads,
          pendingDownloads: initialPending,
          completedDownloads: totalDownloads - initialPending,
          downloadType: initialPending === 0 ? DOWNLOAD_TYPE.DOWNLOADED : DOWNLOAD_TYPE.DOWNLOADING,
          progress: totalDownloads ? (totalDownloads - initialPending) / totalDownloads : 1
        }
      };
    })
  );

  if (totalDownloads === 0) return;

  for (const [sceneIndex, sceneItem] of dataItem.payload.scenes.entries()) {
    const downloadableUris = sceneItem?.downloadableUris ?? [];

    for (const objectItem of downloadableUris) {
      const {
        chromaKeyFilteredVideo,
        color,
        direction,
        height,
        id,
        innerAngle,
        intensity,
        isSpatialSound,
        maxDistance,
        minDistance,
        outerAngle,
        physicalWidth,
        position,
        rolloffModel,
        rotation,
        scale,
        shadowMapSize,
        shadowOpacity,
        stable,
        temperature,
        title,
        type,
        uri,
        width
      } = objectItem;

      const { directoryName, folderName, storageName } = storageNameCreator({
        dataItem,
        objectItem,
        sceneIndex
      });

      try {
        const dirInfo = await FileSystem.getInfoAsync(folderName);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(folderName, { intermediates: true });
        }

        const existingFileInfo = await FileSystem.getInfoAsync(directoryName);
        const alreadyOnDisk = existingFileInfo?.exists;

        let size = 0;
        let finalLocalUri = undefined;

        if (alreadyOnDisk) {
          size = existingFileInfo?.size ?? 0;
          finalLocalUri = directoryName;
        } else if (uri) {
          const downloadResumable = FileSystem.createDownloadResumable(
            uri,
            directoryName,
            {},
            (progress) => downloadProgressInBytes(progress, index, setData)
          );

          const fileSystemDownload = await downloadResumable.downloadAsync();
          finalLocalUri = fileSystemDownload?.uri;

          const fileSystemInfo = finalLocalUri
            ? await FileSystem.getInfoAsync(finalLocalUri)
            : null;

          size = fileSystemInfo?.size ?? 0;
        }

        const newLocalUriItem = {
          chromaKeyFilteredVideo,
          color,
          direction,
          height,
          id,
          innerAngle: innerAngle && parseInt(innerAngle, 10),
          intensity,
          isSpatialSound,
          maxDistance: maxDistance && parseFloat(maxDistance),
          minDistance: minDistance && parseFloat(minDistance),
          outerAngle: outerAngle && parseInt(outerAngle, 10),
          physicalWidth: physicalWidth && parseFloat(physicalWidth),
          position,
          rolloffModel,
          rotation,
          scale,
          shadowMapSize: shadowMapSize && parseInt(shadowMapSize, 10),
          shadowOpacity: shadowOpacity && parseFloat(shadowOpacity),
          size,
          stable,
          temperature,
          title,
          type,
          uri: finalLocalUri,
          width
        };

        setData((prev) =>
          (prev ?? []).map((item, i) => {
            if (i !== index) return item;

            const prevPayload = item?.payload ?? {};
            const prevScenes = prevPayload?.scenes ?? [];

            const nextScenes = prevScenes.map((scene, si) => {
              if (si !== sceneIndex) return scene;

              const prevLocal = scene?.localUris ?? [];
              const alreadyInState = prevLocal.some((x) => x?.id === id);

              return {
                ...scene,
                localUris: alreadyInState ? prevLocal : [...prevLocal, newLocalUriItem]
              };
            });

            const prevPending = prevPayload?.pendingDownloads ?? totalDownloads;
            const nextPending = Math.max(prevPending - 1, 0);

            const nextCompleted = (prevPayload?.completedDownloads ?? 0) + 1;

            const nextProgress = totalDownloads ? nextCompleted / totalDownloads : 1;

            const nextItem = {
              ...item,
              payload: {
                ...prevPayload,
                scenes: nextScenes,
                size: (prevPayload.size ?? 0) + size,
                pendingDownloads: nextPending,
                completedDownloads: nextCompleted,
                progress: nextProgress,
                downloadType:
                  nextPending === 0 ? DOWNLOAD_TYPE.DOWNLOADED : DOWNLOAD_TYPE.DOWNLOADING
              }
            };

            try {
              addToStore(storageName, nextItem);
            } catch (err) {
              console.error(err);
            }

            return nextItem;
          })
        );
      } catch (e) {
        console.error(e);
      }
    }
  }
};
/* eslint-enable complexity */

const downloadProgressInBytes = (progress, index, setData) => {
  setData((prev) =>
    (prev ?? []).map((item, i) => {
      if (i !== index) return item;

      const payload = item?.payload ?? {};

      if ((payload.pendingDownloads ?? 0) === 0) {
        return item;
      }

      const currentSize = payload.size ?? 0;
      const totalSize = payload.totalSize ?? 1;

      const progressSize = currentSize + (progress?.totalBytesWritten ?? 0);
      const progressValue = progressSize / totalSize;

      return {
        ...item,
        payload: {
          ...payload,
          downloadType: DOWNLOAD_TYPE.DOWNLOADING,
          progressSize,
          progress: progressValue
        }
      };
    })
  );
};
