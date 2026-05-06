import {
  launchCameraAsync,
  launchImageLibraryAsync,
  PermissionStatus,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync
} from 'expo-image-picker';
import {
  addAssetsToAlbumAsync,
  createAlbumAsync,
  createAssetAsync,
  getAlbumAsync,
  getPermissionsAsync,
  requestPermissionsAsync
} from 'expo-media-library';
import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';

import appJson from '../../app.json';
import { device, texts } from '../config';

type TMediaTypeOptions = 'images' | 'videos' | Array<'images' | 'videos'>;

export const MediaTypeOptions: Record<'Images' | 'Videos' | 'All', TMediaTypeOptions> = {
  Images: 'images',
  Videos: 'videos',
  All: ['images', 'videos']
};

const saveImageToGallery = async (uri: string) => {
  // Check existing permission status first to avoid triggering the iOS photo
  // picker overlay when the user previously granted only limited access.
  const { status: existingStatus, canAskAgain } = await getPermissionsAsync();
  const appName = appJson.expo.name;

  let status = existingStatus;

  if (status !== PermissionStatus.GRANTED) {
    if (canAskAgain) {
      ({ status } = await requestPermissionsAsync(undefined, ['photo']));
    }

    if (status !== PermissionStatus.GRANTED) {
      Alert.alert(texts.errors.image.title, texts.errors.image.saveBody, [
        { text: texts.errors.image.cancel, style: 'cancel' },
        { text: texts.errors.image.openSettings, onPress: () => Linking.openSettings() }
      ]);
      return;
    }
  }

  try {
    const asset = await createAssetAsync(uri);

    if (device.platform === 'android') return;

    const album = await getAlbumAsync(appName);

    if (!album) {
      await createAlbumAsync(appName, asset, true);
    } else {
      await addAssetsToAlbumAsync([asset], album, true);
    }
  } catch (error) {
    console.error(error);
  }
};

export const useSelectImage = ({
  allowsEditing = false,
  aspect,
  exif = false,
  mediaTypes = MediaTypeOptions.Images,
  onChange,
  quality = 1
}: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  exif?: boolean;
  mediaTypes?: TMediaTypeOptions;
  onChange?: <T>(
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => React.Dispatch<React.SetStateAction<T>>;
  quality?: number;
} = {}) => {
  const [imageUri, setImageUri] = useState<string>();

  const selectImage = useCallback(async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();

    if (status !== PermissionStatus.GRANTED) {
      Alert.alert(texts.errors.image.title, texts.errors.image.body);
      return;
    }

    // this allows for proper selecting and cropping to 1:1 images (and not videos)
    // for more details about options see: https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickermediatypeoptions
    const result = await launchImageLibraryAsync({
      allowsEditing,
      aspect,
      exif,
      mediaTypes,
      quality
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      onChange ? onChange(setImageUri)(uri) : setImageUri(uri);

      return result.assets[0];
    }
  }, [onChange]);

  return { imageUri, selectImage };
};

export const useCaptureImage = ({
  allowsEditing = false,
  aspect,
  exif = false,
  mediaTypes = MediaTypeOptions.Images,
  onChange,
  quality = 1,
  saveImage = false
}: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  exif?: boolean;
  mediaTypes?: TMediaTypeOptions;
  onChange?: <T>(
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => React.Dispatch<React.SetStateAction<T>>;
  quality?: number;
  saveImage?: boolean;
} = {}) => {
  const [imageUri, setImageUri] = useState<string>();

  const captureImage = useCallback(async () => {
    const { status } = await requestCameraPermissionsAsync();

    if (status !== PermissionStatus.GRANTED) {
      Alert.alert(texts.errors.image.title, texts.errors.image.body);
      return;
    }

    // this allows for proper selecting and cropping to 1:1 images (and not videos)
    // for more details about options see: https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickermediatypeoptions
    const result = await launchCameraAsync({
      allowsEditing,
      aspect,
      exif,
      mediaTypes,
      quality
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      onChange ? onChange(setImageUri)(uri) : setImageUri(uri);

      if (saveImage) {
        await saveImageToGallery(uri);
      }

      return result.assets[0];
    }
  }, [onChange]);

  return { imageUri, captureImage };
};
