/**
 * Icon Mappings Index
 * Central export for all icon library mappings
 */

import { IconLibrary } from '../../../IconProvider';

import { customSvgIconExists, getCustomSvgIcon } from './customSvg';
import { fontawesomeIconMapping, getFontAwesomeIconName } from './fontawesome';
import { fontawesome5IconMapping, getFontAwesome5IconName } from './fontawesome5';
import { fontawesome6IconMapping, getFontAwesome6IconName } from './fontawesome6';
import { getIoniconsIconName, ioniconsIconMapping } from './ionicons';
import {
  getMaterialCommunityIconsIconName,
  materialcommunityiconsIconMapping
} from './materialcommunityicons';
import { getMaterialIconsIconName, materialiconsIconMapping } from './materialicons';
import { getSimpleLineIconsIconName, simplelineiconsIconMapping } from './simplelineicons';
import { getTablerIconName, tablerIconMapping } from './tabler';

export interface IconMapping {
  [key: string]: string;
}

export const iconMappings: Record<IconLibrary, IconMapping> = {
  fontawesome: fontawesomeIconMapping,
  fontawesome5: fontawesome5IconMapping,
  fontawesome6: fontawesome6IconMapping,
  ionicons: ioniconsIconMapping,
  materialcommunityicons: materialcommunityiconsIconMapping,
  materialicons: materialiconsIconMapping,
  simplelineicons: simplelineiconsIconMapping,
  tabler: tablerIconMapping
};

/**
 * Get the mapped icon name for a specific library
 * If no mapping exists, returns the original name (allows using any icon from the library)
 */
/* eslint-disable complexity */
export const getMappedIconName = (unifiedName: string, library: IconLibrary): string => {
  switch (library) {
    case 'fontawesome':
      return getFontAwesomeIconName(unifiedName);
    case 'fontawesome5':
      return getFontAwesome5IconName(unifiedName);
    case 'fontawesome6':
      return getFontAwesome6IconName(unifiedName);
    case 'ionicons':
      return getIoniconsIconName(unifiedName);
    case 'materialcommunityicons':
      return getMaterialCommunityIconsIconName(unifiedName);
    case 'materialicons':
      return getMaterialIconsIconName(unifiedName);
    case 'simplelineicons':
      return getSimpleLineIconsIconName(unifiedName);
    case 'tabler':
      return getTablerIconName(unifiedName);
    // Add other libraries here as they are implemented
    default:
      return unifiedName; // Fallback to original name
  }
};
/* eslint-enable complexity */

export {
  customSvgIconExists,
  getCustomSvgIcon,
  getFontAwesome5IconName,
  getFontAwesome6IconName,
  getFontAwesomeIconName,
  getIoniconsIconName,
  getMaterialCommunityIconsIconName,
  getMaterialIconsIconName,
  getSimpleLineIconsIconName,
  getTablerIconName
};
