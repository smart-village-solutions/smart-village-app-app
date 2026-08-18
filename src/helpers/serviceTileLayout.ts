export type TileGridOrientation = 'portrait' | 'landscape';

export type TileGridLayout = {
  columns: number;
};

export const DEFAULT_TILE_GRID_COLUMNS = {
  landscape: 5,
  portrait: 3
} as const;

type TileGridThreshold = {
  maxScale: number;
  landscapeColumns: number;
  portraitColumns: number;
};

const TILE_GRID_THRESHOLDS: TileGridThreshold[] = [
  { maxScale: 0.95, portraitColumns: 4, landscapeColumns: 6 },
  { maxScale: 1.1, portraitColumns: 3, landscapeColumns: 5 },
  { maxScale: 1.25, portraitColumns: 2, landscapeColumns: 4 },
  { maxScale: Number.POSITIVE_INFINITY, portraitColumns: 1, landscapeColumns: 2 }
];

const normalizeTextScale = (textScaleMultiplier: number) =>
  Number.isFinite(textScaleMultiplier) && textScaleMultiplier > 0 ? textScaleMultiplier : 1;

export const resolveTileGridLayout = (
  orientation: TileGridOrientation,
  textScaleMultiplier = 1
): TileGridLayout => {
  const safeScale = normalizeTextScale(textScaleMultiplier);
  const threshold =
    TILE_GRID_THRESHOLDS.find((item) => safeScale <= item.maxScale) || TILE_GRID_THRESHOLDS[1];

  return {
    columns: orientation === 'landscape' ? threshold.landscapeColumns : threshold.portraitColumns
  };
};
