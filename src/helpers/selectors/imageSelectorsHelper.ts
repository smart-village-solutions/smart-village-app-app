import * as FileSystem from 'expo-file-system/legacy';
import { ImagePickerAsset } from 'expo-image-picker';
import { Alert } from 'react-native';

import { consts, texts } from '../../config';
import { deleteMediaContent } from '../../queries/mediaContent';
import { calendarDeleteFile } from '../../queries/volunteer';
import { errorTextGenerator } from '../consul';
import { deleteArrayItem } from '../deleteArrayItem';

const { IMAGE_FROM, IMAGE_TYPE_REGEX, URL_REGEX, IMAGE_SELECTOR_TYPES } = consts;

const EXIF_COMPARISON_EPSILON = 0.000001;

const parseExifCoordinatePart = (part: unknown): number | undefined => {
  if (typeof part === 'number') {
    return Number.isFinite(part) ? part : undefined;
  }

  if (typeof part === 'string') {
    if (part.includes('/')) {
      const [numeratorRaw, denominatorRaw] = part.split('/');
      const numerator = Number(numeratorRaw);
      const denominator = Number(denominatorRaw);

      if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
        return numerator / denominator;
      }

      return undefined;
    }

    const parsed = Number(part);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (part && typeof part === 'object') {
    const numerator = Number((part as { numerator?: number }).numerator);
    const denominator = Number((part as { denominator?: number }).denominator);

    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
      return numerator / denominator;
    }
  }

  return undefined;
};

export const parseExifCoordinate = (
  coordinate: unknown,
  ref?: string
): number | undefined => {
  const normalizeWithRef = (value: number) => {
    if (ref === 'S' || ref === 'W') {
      return -Math.abs(value);
    }

    return value;
  };

  if (typeof coordinate === 'number') {
    return normalizeWithRef(coordinate);
  }

  if (typeof coordinate === 'string') {
    const dmsParts = coordinate
      .split(',')
      .map((part) => parseExifCoordinatePart(part.trim()))
      .filter((part): part is number => part !== undefined);

    if (dmsParts.length === 3) {
      const decimal = dmsParts[0] + dmsParts[1] / 60 + dmsParts[2] / 3600;
      return normalizeWithRef(decimal);
    }

    const parsed = parseExifCoordinatePart(coordinate);
    return parsed === undefined ? undefined : normalizeWithRef(parsed);
  }

  if (Array.isArray(coordinate)) {
    const [degreesRaw, minutesRaw = 0, secondsRaw = 0] = coordinate;
    const degrees = parseExifCoordinatePart(degreesRaw);
    const minutes = parseExifCoordinatePart(minutesRaw) || 0;
    const seconds = parseExifCoordinatePart(secondsRaw) || 0;

    if (degrees === undefined) {
      return undefined;
    }

    const decimal = degrees + minutes / 60 + seconds / 3600;
    return normalizeWithRef(decimal);
  }

  return undefined;
};

export const getLocationFromExif = (exif?: {
  GPSLatitude?: unknown;
  GPSLatitudeRef?: string;
  GPSLongitude?: unknown;
  GPSLongitudeRef?: string;
}) => {
  const latitude = parseExifCoordinate(exif?.GPSLatitude, exif?.GPSLatitudeRef);
  const longitude = parseExifCoordinate(exif?.GPSLongitude, exif?.GPSLongitudeRef);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return undefined;
  }

  return {
    latitude,
    longitude
  };
};

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

  const exifLocation = getLocationFromExif(exif);
  const { size } = (await FileSystem.getInfoAsync(uri)) as { size: number };

  let location = {
    latitude: exifLocation?.latitude,
    longitude: exifLocation?.longitude
  };

  if (
    from === IMAGE_FROM.CAMERA &&
    (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude))
  ) {
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
    const allowedAttachmentTypes = configuration?.limitation?.allowedAttachmentTypes?.value || '';

    if (!allowedAttachmentTypes.includes(extension)) {
      return Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.imageType);
    }

    if (Number.isFinite(location.latitude) && Number.isFinite(location.longitude)) {
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
        coordinateCheck.setSelectedPosition(undefined);
        coordinateCheck.setUpdateRegionFromImage(false);
        setValue('city', '');
        setValue('houseNumber', '');
        setValue('street', '');
        setValue('postalCode', '');
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
  deleteImage?: any; // for Consul or Volunteer mutation
  imageId?: number | string; // for Consul mutation
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
    const exifLocation = getLocationFromExif(imagesAttributes?.[index]?.exif);
    const { selectedPosition, setValue = () => {} } = coordinateCheck || {};

    if (
      Math.abs((selectedPosition?.latitude || 0) - (exifLocation?.latitude || 0)) <
        EXIF_COMPARISON_EPSILON &&
      Math.abs((selectedPosition?.longitude || 0) - (exifLocation?.longitude || 0)) <
        EXIF_COMPARISON_EPSILON
    ) {
      coordinateCheck.setSelectedPosition(undefined);
      coordinateCheck.setUpdateRegionFromImage(false);

      setValue('city', '');
      setValue('houseNumber', '');
      setValue('street', '');
      setValue('postalCode', '');
    }
  }

  if (
    selectorType === IMAGE_SELECTOR_TYPES.VOLUNTEER &&
    !!deleteImage &&
    !!imagesAttributes[index]?.guid
  ) {
    try {
      await deleteImage(imagesAttributes[index].guid);
    } catch (err) {
      console.error(err);
    }
  } else if (!!imageId && !!deleteImage) {
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
