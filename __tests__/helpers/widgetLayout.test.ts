import { resolveWidgetLayout } from '../../src/helpers/widgetLayout';

describe('widgetLayout', () => {
  it('keeps five widgets on one row at the standard scale on a regular phone', () => {
    expect(resolveWidgetLayout({ availableWidth: 328, itemCount: 5, textScale: 1 })).toEqual({
      columns: 5,
      itemWidth: 328 / 5
    });
  });

  it('keeps at least four widgets on the first row on a narrow phone', () => {
    expect(resolveWidgetLayout({ availableWidth: 288, itemCount: 5, textScale: 1 }).columns).toBe(
      4
    );
  });

  it('keeps four widgets on one row when their measured widths fit', () => {
    expect(
      resolveWidgetLayout({ availableWidth: 360, itemCount: 4, minItemWidth: 90, textScale: 1 })
    ).toEqual({ columns: 4, itemWidth: 90 });
  });

  it.each([
    [3, [3]],
    [4, [2, 2]],
    [5, [3, 2]],
    [7, [3, 2, 2]]
  ])('balances %s widgets within three available columns', (itemCount, rowSizes) => {
    expect(
      resolveWidgetLayout({
        availableWidth: 359,
        balanceWidgetRows: true,
        itemCount: itemCount as number,
        minItemWidth: 90,
        textScale: 1
      }).rowSizes
    ).toEqual(rowSizes);
  });

  it.each([undefined, false, 'true', 1, null])(
    'preserves the original columns unless explicitly enabled (%s)',
    (balanceWidgetRows) => {
      const layout = resolveWidgetLayout({
        availableWidth: 359,
        balanceWidgetRows: balanceWidgetRows as boolean,
        itemCount: 4,
        minItemWidth: 90,
        textScale: 1
      });
      expect(layout.columns).toBe(3);
      expect(layout.rowSizes).toBeUndefined();
    }
  );

  it.each([3, 4, 5, 7])(
    'keeps the minimum number of rows at all widths for %s widgets',
    (itemCount) => {
      [0, 80, 180, 270, 450, 900].forEach((availableWidth) => {
        [1, 1.3, 2.6].forEach((textScale) => {
          const options = { availableWidth, itemCount, minItemWidth: 90, textScale };
          const original = resolveWidgetLayout(options);
          const balanced = resolveWidgetLayout({ ...options, balanceWidgetRows: true });
          const rows = balanced.rowSizes!;
          expect(rows.reduce((sum, size) => sum + size, 0)).toBe(itemCount);
          expect(rows).toHaveLength(Math.ceil(itemCount / original.columns));
          expect(Math.max(...rows)).toBeLessThanOrEqual(original.columns);
          expect(Math.max(...rows) - Math.min(...rows)).toBeLessThanOrEqual(1);
        });
      });
    }
  );

  it('balances four widgets across two rows when text is enlarged', () => {
    expect(resolveWidgetLayout({ availableWidth: 328, itemCount: 4, textScale: 1.3 }).columns).toBe(
      2
    );
  });

  it('keeps two columns when enlarged text leaves a single widget in the last row', () => {
    expect(resolveWidgetLayout({ availableWidth: 328, itemCount: 5, textScale: 1.3 }).columns).toBe(
      2
    );
  });

  it('uses a device-normalized minimum item width', () => {
    expect(
      resolveWidgetLayout({
        availableWidth: 288,
        itemCount: 5,
        minItemWidth: 72,
        textScale: 1
      }).columns
    ).toBe(4);
  });

  it('switches widgets to list mode at a very large effective text scale', () => {
    expect(resolveWidgetLayout({ availableWidth: 328, itemCount: 4, textScale: 2.6 }).columns).toBe(
      1
    );
  });
});
