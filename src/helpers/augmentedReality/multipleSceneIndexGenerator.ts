import moment from 'moment';
import { extendMoment } from 'moment-range';

const extendedMoment = extendMoment(moment);

type TTextures = Array<{ size: number; stable: boolean; title: string; type: string; uri: string }>;
type TModels = Array<{
  position?: number[];
  rotation?: number[];
  scale?: number[];
  size?: number;
  title?: string;
  type: string;
  uri: string;
}>;
type TScenes = {
  localUris: Array<{
    models?: TModels;
    stable?: boolean;
    textures?: TTextures;
    type?: string;
    uri?: string;
  }>;
};
type TGenerator = { startDate?: Date; timePeriodInDays?: number; scenes: Array<TScenes> };

/**
 * index creation function for model and texture
 *
 * @param {string} startDate           start date of the model
 * @param {number} timePeriodInDays    time period in days of the model
 * @param {array}  scenes              array of models
 *
 * @return {object} both parsed values as an object, like { modelIndex: 1, textureIndex: 1 }
 */
export const multipleSceneIndexGenerator = ({
  scenes,
  startDate,
  timePeriodInDays
}: TGenerator) => {
  let modelIndex = 0;
  const scenesCount = scenes?.length;
  let localUris = scenes?.[modelIndex]?.localUris;
  const models: TModels = [];
  const textures: TTextures = [];

  // if we have multiple scenes, we want to calculate the model and texture based on the current day
  // compared to the `startDate`
  if (scenesCount > 1 && startDate && timePeriodInDays) {
    // all models must have the same number of variable textures. therefore, in order to obtain the
    // number of textures, the textures of the first model were calculated.
    let variableTextures = scenes[modelIndex]?.localUris?.filter(
      ({ type, stable }) => type === 'texture' && !stable
    );
    const variableTexturesCount = variableTextures?.length;

    if (!variableTexturesCount) {
      // nothing to do if there are no unstable textures
      // keep original localUris with modelIndex = 0
      localUris.forEach((subItem) => {
        modelsAndTexturesArrayGenerator(subItem, models, textures, false);
      });

      return { localUris, models, textures };
    }

    const today = new Date();
    // the current day number is the number of running days since the given start date
    const currentDayNumber = extendedMoment.range(startDate, today).diff('days');
    const texture = Math.floor(currentDayNumber / timePeriodInDays);
    const model = Math.floor(texture / variableTexturesCount);
    modelIndex = model % scenesCount;

    // When `variableTextures` are created, they are created according to index 0 of the scene array.
    // Once the `modelIndex` is found, it must be updated to select the correct texture file.
    if (modelIndex > 0) {
      variableTextures = scenes[modelIndex]?.localUris?.filter(
        ({ type, stable }) => type === 'texture' && !stable
      );
    }

    // localUris = [{ type: 'vrx' }, { type: 'texture' }, { type: 'texture' }];
    localUris = scenes?.[modelIndex]?.localUris;

    if (modelIndex > 0) {
      /*
      the first index of scenes is selected because all data except models and textures 
      are in the first index
      firstSceneLocalUris = [
        { type: 'vrx' },
        { type: 'texture' },
        { type: 'texture' },
        // benötigen wir Folgendes.
        { type: 'quad' },
        { type: 'target' },
        { type: 'mp3' }
      ];
      */
      const firstSceneLocalUris = scenes?.[0]?.localUris;

      /*
      according to the date logic, all types in the selected index are equal to uniqueTypes
      uniqueTypes = {'vrx', 'texture'};
       */
      const uniqueTypes = new Set(localUris.map((item) => item.type));

      /* all the data we need except model and texture are merged with localUris
      localUris = [...localUris, { type: 'quad' }, { type: 'target' }, { type: 'mp3' }]; 
      */
      localUris = [
        ...localUris,
        ...firstSceneLocalUris.filter((item) => !uniqueTypes.has(item.type))
      ];
    }

    const textureIndex = texture % variableTexturesCount;
    textures.push(variableTextures?.[textureIndex] as TTextures[0]);

    localUris.forEach((subItem) => {
      modelsAndTexturesArrayGenerator(subItem, models, textures, !!subItem.stable);
    });

    return { localUris, models, textures };
  }

  for (let i = 0; i < scenes.length; i++) {
    localUris = scenes?.[i]?.localUris;
    localUris.forEach((subItem) => {
      modelsAndTexturesArrayGenerator(subItem, models, textures);
    });
  }

  return { localUris, models, textures };
};

const modelsAndTexturesArrayGenerator = (
  subItem: TScenes['localUris'][0],
  models: TModels,
  textures: TTextures,
  shouldPushTexture = true
) => {
  switch (subItem.type) {
    case 'vrx':
      models.push(subItem as TModels[0]);
      break;
    case 'texture':
      shouldPushTexture && textures.push(subItem as TTextures[0]);
      break;
    default:
      break;
  }
};
