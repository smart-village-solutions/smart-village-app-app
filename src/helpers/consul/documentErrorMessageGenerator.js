import * as FileSystem from 'expo-file-system';

import { consts } from '../../config';

const { PDF_TYPE_REGEX } = consts;

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
