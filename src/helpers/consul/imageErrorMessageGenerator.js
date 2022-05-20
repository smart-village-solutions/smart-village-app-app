import * as FileSystem from 'expo-file-system';

import { consts } from '../../config';

const { JPG_TYPE_REGEX } = consts;

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
