import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

import { createChangers } from './src/api';
import type { ChangersNative } from './src/types';
export * from './src/types';
export { ChangersError, maskUUID } from './src/api';
export default createChangers(
  requireOptionalNativeModule<ChangersNative>('ExpoChangers'),
  Platform.OS
);
