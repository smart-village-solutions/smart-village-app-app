import { formatSize } from '../fileSizeHelper';

export const progressSizeGenerator = ({ progressSize, size, totalSize }) => {
  return progressSize
    ? `${size >= totalSize ? formatSize(size) : formatSize(progressSize)} / ${formatSize(
        totalSize
      )}`
    : `${formatSize(totalSize)}`;
};
