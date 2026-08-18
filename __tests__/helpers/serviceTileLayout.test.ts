import {
  DEFAULT_TILE_GRID_COLUMNS,
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
  { textScaleMultiplier: 1.3, orientation: 'portrait', expectedColumns: 1 },
  { textScaleMultiplier: 1.3, orientation: 'landscape', expectedColumns: 2 }
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
