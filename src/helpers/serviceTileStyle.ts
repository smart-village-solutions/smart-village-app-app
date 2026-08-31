import { normalizeStyleValues } from './normalizeStyleValues';

type ServiceTileStyleOptions = {
  fallbackStyle?: Record<string, unknown>;
  itemStyle?: Record<string, unknown>;
};

type ServiceTileIconSizeOptions = {
  columns?: number;
  defaultColumns?: number;
  fallbackSize: number;
  size?: unknown;
  textScaleMultiplier?: number;
};

const positiveNumberOr = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;

export const resolveServiceTileStyle = ({
  fallbackStyle = {},
  itemStyle = {}
}: ServiceTileStyleOptions) => {
  const selectedStyle = Object.keys(itemStyle).length ? itemStyle : fallbackStyle;

  return normalizeStyleValues(selectedStyle);
};

export const resolveServiceTileIconSize = ({
  columns,
  defaultColumns,
  fallbackSize,
  size,
  textScaleMultiplier = 1
}: ServiceTileIconSizeOptions) => {
  const baseSize = positiveNumberOr(size, fallbackSize);
  const scale = positiveNumberOr(textScaleMultiplier, 1);
  const safeColumns = positiveNumberOr(columns, 1);
  const safeDefaultColumns = positiveNumberOr(defaultColumns, safeColumns);
  const denseGridScale = Math.min(1, safeDefaultColumns / safeColumns);

  return baseSize * scale * denseGridScale;
};
