import {
  DEFAULT_TILE_GRID_COLUMNS,
  resolveServiceTileColumns,
  groupServiceTileRows,
  resolveTileGridLayout,
  TileGridOrientation
} from '../../src/helpers/serviceTileLayout';

type TestCase = {
  expectedColumns: number;
  orientation: TileGridOrientation;
  textScaleMultiplier: number;
};

const testCases: TestCase[] = [
  { textScaleMultiplier: 0.9, orientation: 'portrait', expectedColumns: 4 },
  { textScaleMultiplier: 0.9, orientation: 'landscape', expectedColumns: 6 },
  { textScaleMultiplier: 1, orientation: 'portrait', expectedColumns: 3 },
  { textScaleMultiplier: 1, orientation: 'landscape', expectedColumns: 5 },
  { textScaleMultiplier: 1.2, orientation: 'portrait', expectedColumns: 2 },
  { textScaleMultiplier: 1.2, orientation: 'landscape', expectedColumns: 4 },
  { textScaleMultiplier: 1.3, orientation: 'portrait', expectedColumns: 2 },
  { textScaleMultiplier: 1.3, orientation: 'landscape', expectedColumns: 4 },
  { textScaleMultiplier: 5, orientation: 'portrait', expectedColumns: 2 },
  { textScaleMultiplier: 5, orientation: 'landscape', expectedColumns: 4 }
];

describe('serviceTileLayout', () => {
  it.each(testCases)(
    'returns $expectedColumns columns for $orientation and scale $textScaleMultiplier',
    ({ expectedColumns, orientation, textScaleMultiplier }) => {
      expect(resolveTileGridLayout(orientation, textScaleMultiplier).columns).toBe(expectedColumns);
    }
  );

  it('falls back to default scale when text scale is invalid', () => {
    expect(resolveTileGridLayout('portrait', Number.NaN).columns).toBe(
      DEFAULT_TILE_GRID_COLUMNS.portrait
    );
    expect(resolveTileGridLayout('landscape', Number.POSITIVE_INFINITY).columns).toBe(
      DEFAULT_TILE_GRID_COLUMNS.landscape
    );
    expect(resolveTileGridLayout('portrait', -1).columns).toBe(DEFAULT_TILE_GRID_COLUMNS.portrait);
  });
});

describe('service tile column overrides', () => {
  it('keeps three unstyled icons per row with the existing 2.7 portrait override', () => {
    const data = Array.from({ length: 7 }, (_, id) => ({ id, numberOfTiles: { portrait: 2.7 } }));
    expect(groupServiceTileRows(data, 'portrait', 3).map((row) => row.tiles.length)).toEqual([
      3, 3, 1
    ]);
    expect(
      groupServiceTileRows(data, 'portrait', 3, { backgroundColor: '#fff' }).map(
        (row) => row.tiles.length
      )
    ).toEqual([2, 2, 2, 1]);
    expect(
      groupServiceTileRows(
        data.map((tile) => ({ ...tile, tile: 'image.png' })),
        'portrait',
        3
      ).map((row) => row.tiles.length)
    ).toEqual([2, 2, 2, 1]);
    expect(
      groupServiceTileRows(
        data.map((tile) => ({ ...tile, style: { tileStyle: { backgroundColor: '#fff' } } })),
        'portrait',
        3
      ).map((row) => row.tiles.length)
    ).toEqual([2, 2, 2, 1]);
  });

  it.each([
    ['portrait', 3, [3, 3, 1]],
    ['landscape', 5, [5, 2]]
  ] as const)('retains default unstyled row counts in %s', (orientation, columns, expected) => {
    const data = Array.from({ length: 7 }, (_, id) => ({ id, numberOfTiles: undefined }));
    expect(groupServiceTileRows(data, orientation, columns).map((row) => row.tiles.length)).toEqual(
      expected
    );
  });
  it('uses the current orientation and falls back for malformed column counts', () => {
    expect(resolveServiceTileColumns({ portrait: 2, landscape: 4 }, 'landscape', 5)).toBe(4);
    expect(resolveServiceTileColumns({ portrait: 2.5 }, 'portrait', 3)).toBe(2.5);
    for (const value of [0, -1, Infinity, NaN]) {
      expect(resolveServiceTileColumns({ portrait: value }, 'portrait', 3)).toBe(3);
    }
  });
  it('marks a partially filled last row for centering and tolerates thirds', () => {
    const data = Array.from({ length: 4 }, (_, id) => ({ id, numberOfTiles: { portrait: 3 } }));
    const rows = groupServiceTileRows(data, 'portrait', 2);
    expect(rows.map((row) => row.tiles.map((tile) => tile.id))).toEqual([[0, 1, 2], [3]]);
    expect(rows[0].fill).toBe(1);
    expect(rows[1].fill).toBeCloseTo(1 / 3);
  });
});
