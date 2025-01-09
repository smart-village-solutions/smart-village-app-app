import * as FileSystem from 'expo-file-system';
import { ImagePickerAsset } from 'expo-image-picker';
import { Alert } from 'react-native';

import { consts, texts } from '../../config';
import { deleteMediaContent } from '../../queries/mediaContent';
import { calendarDeleteFile } from '../../queries/volunteer';
import { errorTextGenerator } from '../consul';
import { deleteArrayItem } from '../deleteArrayItem';

const { IMAGE_FROM, IMAGE_TYPE_REGEX, URL_REGEX, IMAGE_SELECTOR_TYPES } = consts;

/* eslint-disable complexity */
export const onImageSelect = async ({
  configuration,
  coordinateCheck,
  errorType,
  from = IMAGE_FROM.GALLERY,
  imageFunction,
  imagesAttributes,
  infoAndErrorText,
  lastKnownPosition,
  maxFileSize,
  position,
  reverseGeocode,
  selectorType,
  setImagesAttributes,
  setInfoAndErrorText
}: {
  configuration?: any;
  coordinateCheck?: any;
  errorType: string;
  from?: string;
  imageFunction: () => Promise<ImagePickerAsset | undefined>;
  imagesAttributes: any[];
  infoAndErrorText: string;
  lastKnownPosition?: any;
  maxFileSize: number;
  position?: any;
  reverseGeocode?: any;
  selectorType?: string;
  setImagesAttributes: (imagesAttributes: any[]) => void;
  setInfoAndErrorText: (infoAndErrorText: string) => void;
}) => {
  const { uri, type, exif } = (await imageFunction()) || {};

  if (!uri) return;

  const { GPSLatitude, GPSLongitude } = exif || {};
  const { size } = (await FileSystem.getInfoAsync(uri)) as { size: number };

  let location = { latitude: undefined, longitude: undefined };

  if (from === IMAGE_FROM.GALLERY) {
    location = {
      latitude: GPSLatitude,
      longitude: GPSLongitude
    };
  } else if (from === IMAGE_FROM.CAMERA) {
    location = {
      latitude: position?.coords?.latitude || lastKnownPosition?.coords?.latitude,
      longitude: position?.coords?.longitude || lastKnownPosition?.coords?.longitude
    };
  }

  const { areaServiceData = {}, errorMessage = '', setValue = () => {} } = coordinateCheck || {};

  /* used to specify the mimeType when uploading to the server */
  const imageType = IMAGE_TYPE_REGEX.exec(uri)?.[1];
  const mimeType = `${type}/${imageType}`;
  const uriSplitForImageName = uri.split('/');
  const imageName = uriSplitForImageName[uriSplitForImageName.length - 1];

  if (selectorType === IMAGE_SELECTOR_TYPES.SUE) {
    const extension = mimeType.split('/')[1];

    if (!configuration.limitation.allowedAttachmentTypes.value.includes(extension)) {
      return Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.imageType);
    }

    if (!!location.latitude && !!location.longitude) {
      try {
        await reverseGeocode({
          areaServiceData,
          errorMessage,
          position: location,
          setValue
        });

        coordinateCheck.setSelectedPosition(location);
        coordinateCheck.setUpdateRegionFromImage(true);
        coordinateCheck.setShowCoordinatesFromImageAlert(false);
      } catch (error) {
        console.error(error);
      }
    }
  }

  errorTextGenerator({
    errorType,
    infoAndErrorText,
    maxFileSize,
    mimeType,
    setInfoAndErrorText,
    uri
  });

  setImagesAttributes([...imagesAttributes, { uri, mimeType, imageName, size, exif }]);
  // setIsModalVisible(!isModalVisible);
};

export const onDeleteImage = async ({
  coordinateCheck,
  deleteImage,
  imageId,
  imagesAttributes,
  index,
  infoAndErrorText,
  isMultiImages,
  selectorType,
  setImagesAttributes,
  setInfoAndErrorText
}: {
  coordinateCheck?: any;
  deleteImage?: any; // For Consul Mutation
  imageId?: number | string; // For Consul Mutation
  imagesAttributes: any[];
  index: number;
  infoAndErrorText: any[];
  isMultiImages?: boolean;
  selectorType?: string;
  setImagesAttributes: (imagesAttributes: any[]) => void;
  setInfoAndErrorText: (infoAndErrorText: any[]) => void;
}) => {
  if (imagesAttributes[index]?.id) {
    try {
      await deleteMediaContent(imagesAttributes[index].id);
    } catch (err) {
      console.error(err);
    }
  }

  if (selectorType === IMAGE_SELECTOR_TYPES.SUE) {
    const { GPSLatitude, GPSLongitude } = imagesAttributes?.[index]?.exif || {};
    const { selectedPosition, setValue = () => {} } = coordinateCheck || {};

    if (
      selectedPosition?.latitude === GPSLatitude &&
      selectedPosition?.longitude === GPSLongitude
    ) {
      coordinateCheck.setSelectedPosition(undefined);
      coordinateCheck.setUpdateRegionFromImage(false);

      setValue('city', '');
      setValue('houseNumber', '');
      setValue('street', '');
      setValue('postalCode', '');
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
/* eslint-enable complexity */
