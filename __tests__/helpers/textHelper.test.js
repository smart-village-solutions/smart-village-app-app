import { subtitle } from '../../src/helpers/textHelper';

describe('subtitle', () => {
  it('keeps the time when formatting a date without a third detail', () => {
    expect(subtitle('01.01.2030', undefined, '10:00')).toBe('01.01.2030, 10:00 Uhr');
  });

  it('preserves the existing combinations', () => {
    expect(subtitle('01.01.2030', 'Magdeburg', '10:00')).toBe('01.01.2030, 10:00 Uhr | Magdeburg');
    expect(subtitle('01.01.2030', 'Magdeburg')).toBe('01.01.2030 | Magdeburg');
    expect(subtitle(undefined, 'Magdeburg', '10:00')).toBe('10:00 Uhr | Magdeburg');
  });
});
