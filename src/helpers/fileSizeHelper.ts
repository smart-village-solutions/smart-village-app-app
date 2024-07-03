export const formatSize = (size: number, decimals = 1) => {
  if (size < 100) {
    return `${size.toFixed(decimals)} B`;
  } else if (size < 100000) {
    return `${(size / 1000).toFixed(decimals)} KB`;
  } else if (size < 100000000) {
    return `${(size / 1000000).toFixed(decimals)} MB`;
  } else {
    return `${(size / 1000000000).toFixed(decimals)} GB`;
  }
};

// thanks for : https://gist.github.com/zentala/1e6f72438796d74531803cc3833c039c
export const formatSizeStandard = (bytes: number, decimals = 1) => {
  if (bytes == 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = parseFloat((bytes / Math.pow(1024, index)).toFixed(decimals));

  return `${size} ${sizes[index]}`;
};
