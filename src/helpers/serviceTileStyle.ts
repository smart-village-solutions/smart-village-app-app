import { normalizeStyleValues } from './normalizeStyleValues';

type ServiceTileStyleOptions = {
  fallbackStyle?: Record<string, unknown>;
  itemStyle?: Record<string, unknown>;
};

export const resolveServiceTileStyle = ({
  fallbackStyle = {},
  itemStyle = {}
}: ServiceTileStyleOptions) => {
  const selectedStyle = Object.keys(itemStyle).length ? itemStyle : fallbackStyle;

  return normalizeStyleValues(selectedStyle);
};
