import { osVersion } from 'expo-device';
import { useContext } from 'react';

import { device } from '../../config';
import { SettingsContext } from '../../SettingsProvider';

export const supportedDevice = () => {
  const { globalSettings } = useContext(SettingsContext);

  return { isSupported: osVersion >= globalSettings.augmentedReality[device.platform] };
};
