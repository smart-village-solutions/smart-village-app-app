export const formatSize = (size: number) => {
  if (size < 100) {
    return `${size.toFixed(1)} B`;
  } else if (size < 100000) {
    return `${(size / 1000).toFixed(1)} KB`;
  } else if (size < 100000000) {
    return `${(size / 1000000).toFixed(1)} MB`;
  } else {
    return `${(size / 1000000000).toFixed(1)} GB`;
  }
};
