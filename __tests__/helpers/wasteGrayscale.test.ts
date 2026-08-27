import {
  resolveWasteDisplayColor,
  resolveWasteMarkedDatesForDisplay
} from '../../src/helpers/wasteGrayscale';

describe('wasteGrayscale', () => {
  it('converts waste colors only for grayscale presentation', () => {
    expect(resolveWasteDisplayColor('#FFCC00', false)).toBe('#FFCC00');
    expect(resolveWasteDisplayColor('#FFCC00', true)).toMatch(/^rgb\((\d+), \1, \1\)$/);
  });

  it('creates grayscale calendar dots without mutating source data', () => {
    const markedDates = {
      '2026-09-01': {
        dots: [{ color: '#FFCC00', selectedColor: '#C44D36' }],
        marked: true,
        note: 'Gelbe Tonne'
      }
    };

    const displayDates = resolveWasteMarkedDatesForDisplay(markedDates, true);

    expect(displayDates).not.toBe(markedDates);
    expect(displayDates['2026-09-01'].dots[0].color).toMatch(/^rgb\((\d+), \1, \1\)$/);
    expect(displayDates['2026-09-01'].dots[0].selectedColor).toMatch(/^rgb\((\d+), \1, \1\)$/);
    expect(displayDates['2026-09-01'].note).toBe('Gelbe Tonne');
    expect(markedDates['2026-09-01'].dots[0].color).toBe('#FFCC00');
  });
});
