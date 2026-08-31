jest.mock('../../src/config', () => ({
  normalize: (value: number) => value * 2
}));

import {
  resolveServiceTileIconSize,
  resolveServiceTileStyle
} from '../../src/helpers/serviceTileStyle';
import { ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS } from '../../src/helpers/accessibilitySettingsHelper';
import {
  DEFAULT_TILE_GRID_COLUMNS,
  resolveTileGridLayout
} from '../../src/helpers/serviceTileLayout';

describe('serviceTileStyle', () => {
  it('prefers item-level styles and normalizes numeric values', () => {
    const style = resolveServiceTileStyle({
      fallbackStyle: { backgroundColor: '#0000FF' },
      itemStyle: { backgroundColor: '#C44D36', borderColor: '#FFFFFF', borderWidth: 2 }
    });

    expect(style).toEqual({
      backgroundColor: '#C44D36',
      borderColor: '#FFFFFF',
      borderWidth: 4
    });
  });

  it('uses and normalizes the global fallback when no item override exists', () => {
    const style = resolveServiceTileStyle({
      fallbackStyle: { color: '#C44D36', fontSize: 14 }
    });

    expect(style).toEqual({ color: '#C44D36', fontSize: 28 });
  });

  it.each([
    {
      level: 'Sehr klein',
      textScaleMultiplier: ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS[0],
      expectedSize: 67.5
    },
    {
      level: 'Klein',
      textScaleMultiplier: ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS[1],
      expectedSize: 71.25
    },
    {
      level: 'Standard',
      textScaleMultiplier: ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS[2],
      expectedSize: 100
    },
    {
      level: 'Groß',
      textScaleMultiplier: ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS[3],
      expectedSize: 110
    },
    {
      level: 'Sehr groß',
      textScaleMultiplier: ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS[4],
      expectedSize: 120
    },
    {
      level: 'Extra groß',
      textScaleMultiplier: ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS[5],
      expectedSize: 130
    },
    {
      level: 'Maximum',
      textScaleMultiplier: ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS[6],
      expectedSize: 140
    }
  ])(
    'scales the remote icon size to $expectedSize for $level',
    ({ expectedSize, textScaleMultiplier }) => {
      const { columns } = resolveTileGridLayout('portrait', textScaleMultiplier);

      expect(
        resolveServiceTileIconSize({
          columns,
          defaultColumns: DEFAULT_TILE_GRID_COLUMNS.portrait,
          fallbackSize: 30,
          size: 100,
          textScaleMultiplier
        })
      ).toBeCloseTo(expectedSize);
    }
  );

  it('accounts for a dense landscape grid without enlarging sparse grids', () => {
    expect(
      resolveServiceTileIconSize({
        columns: 6,
        defaultColumns: DEFAULT_TILE_GRID_COLUMNS.landscape,
        fallbackSize: 30,
        size: 60,
        textScaleMultiplier: 0.9
      })
    ).toBeCloseTo(45);
    expect(
      resolveServiceTileIconSize({
        columns: 4,
        defaultColumns: DEFAULT_TILE_GRID_COLUMNS.landscape,
        fallbackSize: 30,
        size: 60,
        textScaleMultiplier: 1.4
      })
    ).toBeCloseTo(84);
  });

  it('uses safe fallbacks for invalid icon sizes and text scales', () => {
    expect(
      resolveServiceTileIconSize({
        fallbackSize: 30,
        size: Number.NaN,
        textScaleMultiplier: Number.POSITIVE_INFINITY
      })
    ).toBe(30);
  });
});
