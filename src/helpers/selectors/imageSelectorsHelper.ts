import * as FileSystem from 'expo-file-system';

import { consts } from '../../config';
import { deleteMediaContent } from '../../queries/mediaContent';
import { calendarDeleteFile } from '../../queries/volunteer';
import { errorTextGenerator } from '../consul';
import { deleteArrayItem } from '../deleteArrayItem';
import { ImagePickerAsset } from 'expo-image-picker';

const { IMAGE_FROM, IMAGE_TYPE_REGEX, URL_REGEX } = consts;

export const onImageSelect = async ({
  errorType,
  from = IMAGE_FROM.GALLERY,
  imageFunction,
  imagesAttributes,
  infoAndErrorText,
  setImagesAttributes,
  setInfoAndErrorText
}: {
  errorType: string;
  from?: string;
  imageFunction: () => Promise<ImagePickerAsset | undefined>;
  imagesAttributes: any[];
  infoAndErrorText: string;
  setImagesAttributes: (imagesAttributes: any[]) => void;
  setInfoAndErrorText: (infoAndErrorText: string) => void;
}) => {
  const { uri, type, exif } = (await imageFunction()) || {};

  if (!uri) return;

  const { size } = (await FileSystem.getInfoAsync(uri)) as { size: number };

  /* used to specify the mimeType when uploading to the server */
  const imageType = IMAGE_TYPE_REGEX.exec(uri)?.[1];
  const mimeType = `${type}/${imageType}`;
  const uriSplitForImageName = uri.split('/');
  const imageName = uriSplitForImageName[uriSplitForImageName.length - 1];

  errorTextGenerator({ errorType, infoAndErrorText, mimeType, setInfoAndErrorText, uri });

  setImagesAttributes([...imagesAttributes, { uri, mimeType, imageName, size, exif }]);
};

export const onDeleteImage = async ({
  deleteImage,
  imageId,
  imagesAttributes,
  index,
  infoAndErrorText,
  isMultiImages,
  setImagesAttributes,
  setInfoAndErrorText
}: {
  deleteImage?: any; // For Consul Mutation
  imageId?: number | string; // For Consul Mutation
  imagesAttributes: any[];
  index: number;
  infoAndErrorText: any[];
  isMultiImages?: boolean;
  setImagesAttributes: (imagesAttributes: any[]) => void;
  setInfoAndErrorText: (infoAndErrorText: any[]) => void;
}) => {
  if (!!imagesAttributes[index]?.id) {
    try {
      await deleteMediaContent(imagesAttributes[index].id);
    } catch (err) {
      console.error(err);
    }
  }

  if (!!imageId && !!deleteImage) {
    try {
      await deleteImage({ variables: { id: imageId } });
    } catch (err) {
      console.error(err);
    }
  }

  if (isMultiImages) {
    const isURL = URL_REGEX.test(imagesAttributes[index].uri);

    if (isURL) {
      try {
        await calendarDeleteFile(imagesAttributes[index].fileId, imagesAttributes[index].entryId);
      } catch (error) {
        console.error(error);
      }
    }
  }

  setImagesAttributes(deleteArrayItem(imagesAttributes, index));
  setInfoAndErrorText(deleteArrayItem(infoAndErrorText, index));
};
