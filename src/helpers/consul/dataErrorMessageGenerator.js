/* eslint-disable no-case-declarations */
import * as FileSystem from 'expo-file-system';

import { consts, texts } from '../../config';
import { formatSize, formatSizeStandard } from '../fileSizeHelper';

const { IMAGE_SELECTOR_ERROR_TYPES, JPG_TYPE_REGEX, PDF_TYPE_REGEX } = consts;

export const documentErrorMessageGenerator = async (uri, maxFileSize = 3145728) => {
  const { size } = await FileSystem.getInfoAsync(uri);

  const isPDF = PDF_TYPE_REGEX.test(uri);
  const isGreaterMaxFileSize = size > maxFileSize;

  const errorMessage =
    !isPDF && isGreaterMaxFileSize
      ? texts.consul.startNew.documentTypeAndSizeError
      : !isPDF
      ? texts.consul.startNew.documentTypeError
      : isGreaterMaxFileSize
      ? texts.noticeboard.alerts.documentSizeError(formatSizeStandard(maxFileSize))
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

export const errorTextGenerator = async ({
  errorType,
  infoAndErrorText,
  mimeType,
  setInfoAndErrorText,
  uri
}) => {
  const { size } = await FileSystem.getInfoAsync(uri);

  switch (errorType) {
    case IMAGE_SELECTOR_ERROR_TYPES.CONSUL:
      const consulErrorText = await imageErrorMessageGenerator(uri);

      setInfoAndErrorText([
        ...infoAndErrorText,
        {
          errorText: texts.consul.startNew[consulErrorText],
          infoText: `(${mimeType}, ${formatSize(size)})`
        }
      ]);
      break;
    case IMAGE_SELECTOR_ERROR_TYPES.VOLUNTEER:
      /* variable to find the name of the image */
      const uriSplitForImageName = uri.split('/');
      const imageName = uriSplitForImageName[uriSplitForImageName.length - 1];

      /* the server does not support files more than 10MB in size. */
      setInfoAndErrorText([
        ...infoAndErrorText,
        {
          errorText: size > 10485760 && texts.volunteer.imageGreater10MBError,
          infoText: `${imageName}`
        }
      ]);
      break;
    case IMAGE_SELECTOR_ERROR_TYPES.SUE:
      /* the server does not support files more than 10MB in size. */
      setInfoAndErrorText([
        ...infoAndErrorText,
        {
          errorText: size > 10485760 && texts.sue.report.alerts.imageGreater10MBError
        }
      ]);
      break;
    default:
      break;
  }
};
