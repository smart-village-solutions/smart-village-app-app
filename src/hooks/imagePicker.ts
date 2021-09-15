import {
  launchImageLibraryAsync,
  MediaTypeOptions,
  PermissionStatus,
  requestMediaLibraryPermissionsAsync
} from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { texts } from '../config';

export const useSelectImage = () => {
  const [imageUri, setImageUri] = useState<string>();

  const selectImage = useCallback(async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();

    if (status !== PermissionStatus.GRANTED) {
      Alert.alert(texts.errors.image.title, texts.errors.image.body);
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
    }
  }, []);

  return { imageUri, selectImage };
};
