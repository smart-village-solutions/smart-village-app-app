import * as FileSystem from 'expo-file-system';

import { consts } from '../../config';

const { PDF_OR_JPG_TYPE_REGEX } = consts;

export const imageErrorMessageHelper = async (uri) => {
  const { size } = await FileSystem.getInfoAsync(uri);

  const isJPG = PDF_OR_JPG_TYPE_REGEX.test(uri);
  const isGreater1MB = size > 1048576;

  const errorMessage =
    !isJPG && isGreater1MB
      ? 'imageTypeAndSizeError-doesnotmatchanyofacceptedcontenttypesjpg,chooseimagemustbeinbetween0bytesand1mb'
      : !isJPG
      ? 'imageTypeError-doesnotmatchanyofacceptedcontenttypesjpg'
      : isGreater1MB
      ? 'imageSizeError-chooseimagemustbeinbetween0bytesand1mb'
      : '';

  return errorMessage;
};
