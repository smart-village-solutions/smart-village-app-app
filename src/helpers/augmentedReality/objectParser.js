import { Alert } from 'react-native';

import { texts } from '../../config';

import { multipleSceneIndexGenerator } from './multipleSceneIndexGenerator';

export const objectParser = async ({ payload, setObject, setIsLoading, onPress }) => {
  const parsedObject = { textures: [], models: [] };

  const { localUris, models, textures } = multipleSceneIndexGenerator(payload);

  if (payload?.animationName) {
    parsedObject.animationName = payload.animationName;
  }

  if (models.length && textures.length) {
    parsedObject.models = models;
    parsedObject.textures = textures;
  }

  localUris?.forEach((item) => {
    parsedObject[item.type] = {
      chromaKeyFilteredVideo: item?.chromaKeyFilteredVideo,
      color: item?.color,
      direction: item?.direction,
      height: item?.height,
      innerAngle: item?.innerAngle,
      intensity: item?.intensity,
      isSpatialSound: item?.isSpatialSound,
      maxDistance: item?.maxDistance,
      minDistance: item?.minDistance,
      outerAngle: item?.outerAngle,
      physicalWidth: item?.physicalWidth,
      position: item?.position,
      rolloffModel: item?.rolloffModel,
      rotation: item?.rotation,
      scale: item?.scale,
      shadowMapSize: item?.shadowMapSize,
      shadowOpacity: item?.shadowOpacity,
      temperature: item?.temperature,
      uri: item?.uri,
      width: item?.width
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
