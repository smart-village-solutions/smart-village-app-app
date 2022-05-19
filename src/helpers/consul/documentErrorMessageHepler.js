import * as FileSystem from 'expo-file-system';

import { consts } from '../../config';

const { PDF_OR_JPG_TYPE_REGEX } = consts;

export const documentErrorMessageHepler = async (uri) => {
  const { size } = await FileSystem.getInfoAsync(uri);

  const isPDF = PDF_OR_JPG_TYPE_REGEX.test(uri);
  const isGreater3MB = size > 3145728;

  const errorMessage =
    !isPDF && isGreater3MB
      ? 'documentTypeAndSizeError-doesnotmatchanyofacceptedcontenttypespdf,choosedocumentmustbeinbetween0bytesand3mb'
      : !isPDF
      ? 'documentTypeError-doesnotmatchanyofacceptedcontenttypespdf'
      : isGreater3MB
      ? 'documentSizeError-choosedocumentmustbeinbetween0bytesand3mb'
      : '';

  return errorMessage;
};
