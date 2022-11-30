import { Alert } from 'react-native';

import { texts } from '../../config';

import { multipleSceneIndexGenerator } from './multipleSceneIndexGenerator';

export const objectParser = async ({ payload, setObject, setIsLoading, onPress }) => {
  const parsedObject = { textures: [] };

  const { localUris } = multipleSceneIndexGenerator(payload);

  if (localUris?.animationName) {
    parsedObject.animationName = localUris?.animationName;
  }

  localUris?.forEach((item) => {
    if (item.type === 'texture') {
      parsedObject.textures.push({ uri: item.uri });
    } else {
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
    }
  });

  if (!parsedObject?.textures?.length || !parsedObject?.vrx) {
    return Alert.alert(
      texts.augmentedReality.modalHiddenAlertTitle,
      texts.augmentedReality.invalidModelError,
      [{ text: texts.augmentedReality.ok, onPress }]
    );
  }

  setObject(JSON.parse(JSON.stringify(parsedObject)));
  setIsLoading(false);
};
