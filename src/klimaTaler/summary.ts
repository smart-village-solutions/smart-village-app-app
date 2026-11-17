import changers from '../../modules/expo-changers';

import { createSummary } from './createSummary';
import { klimaTalerConfiguration } from './configuration';

export const klimaTalerSummary = createSummary(
  changers,
  klimaTalerConfiguration.isEnabled,
  klimaTalerConfiguration.ready
);
