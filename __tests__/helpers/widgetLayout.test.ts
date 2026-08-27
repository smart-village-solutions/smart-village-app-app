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

  it('balances four widgets across two rows when text is enlarged', () => {
    expect(resolveWidgetLayout({ availableWidth: 328, itemCount: 4, textScale: 1.3 }).columns).toBe(
      2
    );
  });

  it('switches widgets to list mode at a very large effective text scale', () => {
    expect(resolveWidgetLayout({ availableWidth: 328, itemCount: 4, textScale: 2.6 }).columns).toBe(
      1
    );
  });
});
