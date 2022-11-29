import { multipleSceneIndexGenerator } from './multipleSceneIndexGenerator';

export const objectParser = async ({ item, setObject, setIsLoading, onPress }) => {
  const parsedObject = { textures: [] };
  const variableTextures = [];

  const { modalIndex, textureIndex } = await multipleSceneIndexGenerator({
    startDate: item?.payload?.startDate,
    timePeriodInDays: item?.payload?.timePeriodInDays,
    scenes: item?.payload?.scenes
  });

  const localUris =
    item?.payload?.scenes?.[modalIndex]?.localUris || item?.payload?.scenes?.[0]?.localUris;

  localUris.filter(
    ({ stable, uri, type }) => stable && type === 'texture' && parsedObject.textures.push({ uri })
  );

  // combine stable textures with variable textures
  if (typeof modalIndex === 'number' && typeof textureIndex === 'number') {
    localUris.filter(
      ({ stable, uri, type }) => !stable && type === 'texture' && variableTextures.push({ uri })
    );
    parsedObject.textures.push(variableTextures[textureIndex || 0] || []);
  }

  if (localUris?.animationName) {
    parsedObject.animationName = localUris?.animationName;
  }

  localUris?.forEach((item) => {
    if (item.type !== 'texture') {
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
