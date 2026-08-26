import {
  resolveEffectiveTextScale,
  resolveResponsiveGridLayout
} from '../../src/helpers/responsiveGridLayout';

describe('responsiveGridLayout', () => {
  it('combines the system and in-app text scales', () => {
    expect(resolveEffectiveTextScale(1.3, 1.4)).toBeCloseTo(1.82);
  });

  it('falls back for invalid scale values', () => {
    expect(resolveEffectiveTextScale(Number.NaN, -1)).toBe(1);
  });

  it('keeps six compact widgets in a balanced three-column grid on a small device', () => {
    expect(
      resolveResponsiveGridLayout({
        availableWidth: 288,
        gap: 8,
        itemCount: 6,
        maxColumns: 4,
        minItemWidth: 80,
        textScale: 0.9
      })
    ).toEqual({ columns: 3, itemWidth: (288 - 16) / 3 });
  });

  it('uses two columns instead of leaving a single widget in the last row', () => {
    expect(
      resolveResponsiveGridLayout({
        availableWidth: 288,
        gap: 8,
        itemCount: 4,
        maxColumns: 4,
        minItemWidth: 80,
        textScale: 0.9
      }).columns
    ).toBe(2);
  });

  it('switches SUE tiles to a list when scaled cards no longer fit', () => {
    expect(
      resolveResponsiveGridLayout({
        availableWidth: 288,
        gap: 12,
        itemCount: 6,
        maxColumns: 2,
        minItemWidth: 144,
        textScale: 1.4
      }).columns
    ).toBe(1);
  });

  it('keeps one column when the available width is below the accessibility target', () => {
    expect(
      resolveResponsiveGridLayout({
        availableWidth: 40,
        gap: 8,
        itemCount: 2,
        maxColumns: 4,
        minItemWidth: 20,
        textScale: 0.5
      })
    ).toEqual({ columns: 1, itemWidth: 40 });
  });
});
