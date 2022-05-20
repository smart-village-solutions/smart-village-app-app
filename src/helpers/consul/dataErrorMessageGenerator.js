import * as FileSystem from 'expo-file-system';

import { consts } from '../../config';

const { JPG_TYPE_REGEX, PDF_TYPE_REGEX } = consts;

export const documentErrorMessageGenerator = async (uri) => {
  const { size } = await FileSystem.getInfoAsync(uri);

  const isPDF = PDF_TYPE_REGEX.test(uri);
  const isGreater3MB = size > 3145728;

  const errorMessage =
    !isPDF && isGreater3MB
      ? 'documentTypeAndSizeError'
      : !isPDF
      ? 'documentTypeError'
      : isGreater3MB
      ? 'documentSizeError'
      : '';

  return errorMessage;
};

export const imageErrorMessageGenerator = async (uri) => {
  const { size } = await FileSystem.getInfoAsync(uri);

  const isJPG = JPG_TYPE_REGEX.test(uri);
  const isGreater1MB = size > 1048576;

  const errorMessage =
    !isJPG && isGreater1MB
      ? 'imageTypeAndSizeError'
      : !isJPG
      ? 'imageTypeError'
      : isGreater1MB
      ? 'imageSizeError'
      : '';

  return errorMessage;
};
