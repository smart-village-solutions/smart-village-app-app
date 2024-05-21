import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  PermissionStatus,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync
} from 'expo-image-picker';
import {
  addAssetsToAlbumAsync,
  createAlbumAsync,
  createAssetAsync,
  getAlbumAsync,
  requestPermissionsAsync
} from 'expo-media-library';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import appJson from '../../app.json';
import { texts } from '../config';

const saveImageToGallery = async (uri: string) => {
  const { status } = await requestPermissionsAsync();
  const appName = appJson.expo.name;

  if (status !== PermissionStatus.GRANTED) {
    return;
  }

  try {
    const asset = await createAssetAsync(uri);
    const album = await getAlbumAsync(appName);

    if (!album) {
      await createAlbumAsync(appName, asset, false);
    } else {
      await addAssetsToAlbumAsync([asset], album, false);
    }
  } catch (error) {
    console.error(error);
  }
};

export const useSelectImage = (
  onChange?: <T>(
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => React.Dispatch<React.SetStateAction<T>>,
  allowsEditing?: boolean,
  aspect?: [number, number],
  quality?: number,
  mediaTypes?: MediaTypeOptions
) => {
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
      mediaTypes: mediaTypes ?? MediaTypeOptions.Images,
      allowsEditing: allowsEditing ?? false,
      aspect,
      quality: quality ?? 1
    });

    if (!result.canceled) {
      onChange ? onChange(setImageUri)(result.assets[0].uri) : setImageUri(result.assets[0].uri);
      return result.assets[0];
    }
  }, [onChange]);

  return { imageUri, selectImage };
};

export const useCaptureImage = (
  onChange?: <T>(
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => React.Dispatch<React.SetStateAction<T>>,
  allowsEditing?: boolean,
  aspect?: [number, number],
  quality?: number,
  mediaTypes?: MediaTypeOptions,
  saveImage?: boolean
) => {
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
      mediaTypes: mediaTypes ?? MediaTypeOptions.Images,
      allowsEditing: allowsEditing ?? false,
      aspect,
      quality: quality ?? 1
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
