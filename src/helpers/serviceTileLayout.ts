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
  { maxScale: Number.POSITIVE_INFINITY, portraitColumns: 2, landscapeColumns: 4 }
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

export type ServiceTileColumns = Partial<Record<TileGridOrientation, number>>;

export const resolveServiceTileColumns = (
  configured: ServiceTileColumns | undefined,
  orientation: TileGridOrientation,
  fallback: number
) => {
  const columns = configured?.[orientation];
  return typeof columns === 'number' && Number.isFinite(columns) && columns >= 1
    ? columns
    : fallback;
};

// Pack mixed column overrides by their share of a row, preserving the configured order.
export const groupServiceTileRows = <
  T extends {
    numberOfTiles?: ServiceTileColumns;
    tile?: unknown;
    style?: { tileStyle?: Record<string, unknown> };
  }
>(
  tiles: readonly T[],
  orientation: TileGridOrientation,
  fallback: number,
  tileStyle: Record<string, unknown> = {}
) => {
  const rows: Array<{ tiles: T[]; fill: number }> = [];
  for (const tile of tiles) {
    const columns = resolveServiceTileColumns(tile.numberOfTiles, orientation, fallback);
    const hasTileStyle =
      !!Object.keys(tileStyle).length || !!Object.keys(tile.style?.tileStyle ?? {}).length;
    // Unstyled icons are narrower (1 / (columns + 1)). Fractional overrides tune their
    // size without reducing the intended row count; integer defaults retain their count.
    const rowColumns = tile.tile || hasTileStyle ? columns : Math.ceil(columns);
    const share = 1 / rowColumns;
    const last = rows[rows.length - 1];
    if (!last || last.fill + share > 1 + 1e-6) {
      rows.push({ tiles: [tile], fill: share });
    } else {
      last.tiles.push(tile);
      last.fill += share;
    }
  }
  return rows;
};
