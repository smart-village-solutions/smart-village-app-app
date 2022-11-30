import moment from 'moment';
import { extendMoment } from 'moment-range';

const extendedMoment = extendMoment(moment);

type TScenes = { localUris: Array<{ type: string; stable: boolean }> };
type TGenerator = { startDate: Date; timePeriodInDays: number; scenes: Array<TScenes> };

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

  // if we have multiple scenes, we want to calculate the model and texture based on the current day
  // compared to the `startDate`
  if (scenesCount > 1 && startDate && timePeriodInDays) {
    const today = new Date();

    // the current day number is the number of running days since the given start date
    const currentDayNumber = extendedMoment.range(startDate, today).diff('days');

    // all models must have the same number of variable textures. therefore, in order to obtain the
    // number of textures, the textures of the first model were calculated.
    const textureCount = scenes[0]?.localUris?.filter(
      ({ type, stable }) => !stable && type === 'texture'
    )?.length;

    const texture = Math.floor(currentDayNumber / timePeriodInDays);
    const model = Math.floor(texture / textureCount);
    modelIndex = model % scenesCount;
    const textureIndex = texture % textureCount;
    localUris = [scenes[modelIndex]?.localUris[textureIndex]];
  }

  return { localUris };
};
