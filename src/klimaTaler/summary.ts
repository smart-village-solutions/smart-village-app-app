import changers from '../../modules/expo-changers';

import { createSummary } from './createSummary';
import { klimaTalerConfiguration } from './configuration';
import { isKlimaTalerEnabled } from './entry';

export const klimaTalerSummary = createSummary(
  changers,
  isKlimaTalerEnabled,
  klimaTalerConfiguration.ready
);
