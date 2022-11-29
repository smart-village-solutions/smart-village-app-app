import moment from 'moment';
import { extendMoment } from 'moment-range';

const extendedMoment = extendMoment(moment);

type TGenerator = { startDate: Date; timePeriodInDays: number; scenes: Array<TScenes> };
type TScenes = { localUris: Array<{ type: string; stable: boolean }> };

/**
 * index creation function for model and texture
 *
 * @param {string} startDate           start date of the model
 * @param {number} timePeriodInDays    time period in days of the model
 * @param {array}  scenes              array of models
 *
 * @return {object} both parsed values as an object, like { modalIndex: 1, textureIndex: 1 }
 */
export const multipleSceneIndexGenerator = ({
  startDate,
  timePeriodInDays,
  scenes
}: TGenerator) => {
  let modalIndex, textureIndex;

  /* all models must have the same number of variable textures. Therefore, in order to obtain the 
      number of textures, the textures of the first model were calculated. */
  if (scenes.length > 1) {
    const today = new Date(),
      differenceDate = extendedMoment.range(startDate, today).diff('days'),
      textureCount = scenes[0]?.localUris?.filter(
        ({ type, stable }) => !stable && type === 'texture'
      )?.length,
      texture = Math.floor(differenceDate / timePeriodInDays),
      modalCount = scenes.length,
      modal = Math.floor(texture / textureCount);

    modalIndex = modal % modalCount;
    textureIndex = texture % textureCount;
  }

  return { modalIndex, textureIndex };
};
