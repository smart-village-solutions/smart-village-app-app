import { formatSize } from '../fileSizeHelper';

/**
 * display bytes downloaded per second in different formats
 *
 * @param {number} progressSize bytes downloaded per second
 * @param {number} size size of objects downloaded to the device
 * @param {number} totalSize total size of objects to be downloaded
 *
 * @return returns data of type `string` according to different states
 */
export const progressSizeGenerator = (progressSize, size, totalSize) => {
  if (!progressSize) {
    return formatSize(totalSize);
  }

  if (size >= totalSize) {
    return formatSize(size);
  }

  return `${formatSize(progressSize)} / ${formatSize(totalSize)}`;
};
