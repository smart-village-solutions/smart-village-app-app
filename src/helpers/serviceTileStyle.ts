import { normalizeStyleValues } from './normalizeStyleValues';
import { resolveGrayscaleConfiguration } from './themeHelper';

type ServiceTileStyleOptions = {
  fallbackStyle?: Record<string, unknown>;
  isGrayscaleEnabled: boolean;
  itemStyle?: Record<string, unknown>;
};

export const resolveServiceTileStyle = ({
  fallbackStyle = {},
  isGrayscaleEnabled,
  itemStyle = {}
}: ServiceTileStyleOptions) => {
  const selectedStyle = Object.keys(itemStyle).length ? itemStyle : fallbackStyle;
  const normalizedStyle = normalizeStyleValues(selectedStyle);

  return isGrayscaleEnabled ? resolveGrayscaleConfiguration(normalizedStyle) : normalizedStyle;
};
