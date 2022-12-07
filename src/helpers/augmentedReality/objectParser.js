import { Alert } from 'react-native';

import { texts } from '../../config';

import { multipleSceneIndexGenerator } from './multipleSceneIndexGenerator';

export const objectParser = async ({ payload, setObject, setIsLoading, onPress }) => {
  const parsedObject = { textures: [], models: [] };

  const { localUris } = multipleSceneIndexGenerator(payload);

  if (payload?.animationName) {
    parsedObject.animationName = payload.animationName;
  }

  localUris?.forEach((item) => {
    parsedObject.models = item?.models;
    parsedObject.textures = item?.textures;
    parsedObject[item.type] = {
      chromaKeyFilteredVideo: item?.chromaKeyFilteredVideo,
      color: item?.color,
      intensity: item?.intensity,
      isSpatialSound: item?.isSpatialSound,
      maxDistance: item?.maxDistance,
      minDistance: item?.minDistance,
      physicalWidth: item?.physicalWidth,
      position: item?.position,
      rolloffModel: item?.rolloffModel,
      rotation: item?.rotation,
      scale: item?.scale,
      temperature: item?.temperature,
      uri: item?.uri
    };
  });

  if (!parsedObject?.textures?.length || !parsedObject?.models?.length) {
    return Alert.alert(
      texts.augmentedReality.modalHiddenAlertTitle,
      texts.augmentedReality.invalidModelError,
      [{ text: texts.augmentedReality.ok, onPress }]
    );
  }

  setObject(JSON.parse(JSON.stringify(parsedObject)));
  setIsLoading(false);
};
