import { getSueLimitOfAreaCity } from '../../src/helpers/sueHelper';

describe('getSueLimitOfAreaCity', () => {
  it('returns configured city when present', () => {
    expect(
      getSueLimitOfAreaCity({
        areaName: 'Kiel [kreisfreie Stadt]',
        configuredCity: 'Flensburg'
      })
    ).toBe('Flensburg');
  });

  it('derives city from geo map area name and removes bracket suffixes', () => {
    expect(
      getSueLimitOfAreaCity({
        areaName: 'Kiel [kreisfreie Stadt]'
      })
    ).toBe('Kiel');
  });
});
