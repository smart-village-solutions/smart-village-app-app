import { osVersion } from 'expo-device';
import { useContext } from 'react';

import { device } from '../../config';
import { SettingsContext } from '../../SettingsProvider';

export const ARSupportingDevice = () => {
  const { globalSettings } = useContext(SettingsContext);

  return { isARSupported: osVersion >= globalSettings?.augmentedReality[device?.platform] };
};
