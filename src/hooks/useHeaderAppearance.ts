import { useContext } from 'react';

import { AccessibilityContext } from '../AccessibilityProvider';
import { sanitizeHeaderAppearance } from '../helpers/headerAppearance';
import { resolveGrayscaleConfiguration } from '../helpers/themeHelper';
import { SettingsContext } from '../SettingsProvider';
import type { ThemeGlobalSettings } from '../types/Theme';

import { useTheme } from './useTheme';

export const useHeaderAppearance = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { isGrayscaleEnabled } = useContext(AccessibilityContext);
  const { mode } = useTheme();
  const config = (globalSettings as ThemeGlobalSettings)?.settings?.accessibility?.header?.[mode];
  const appearance = sanitizeHeaderAppearance(config);

  return isGrayscaleEnabled ? resolveGrayscaleConfiguration(appearance) : appearance;
};
