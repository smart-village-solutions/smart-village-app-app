import {
  launchImageLibraryAsync,
  MediaTypeOptions,
  PermissionStatus,
  requestMediaLibraryPermissionsAsync
} from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { texts } from '../config';

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
      allowsEditing: allowsEditing ?? true,
      aspect: aspect ?? [1, 1],
      quality: quality ?? 1
    });

    if (!result.canceled) {
      onChange ? onChange(setImageUri)(result.assets[0].uri) : setImageUri(result.assets[0].uri);
      return result.assets[0];
    }
  }, [onChange]);

  return { imageUri, selectImage };
};
