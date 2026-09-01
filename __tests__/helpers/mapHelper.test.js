import { isValidGeoLocation, locationLink } from '../../src/helpers/mapHelper';

describe('mapHelper', () => {
  describe('isValidGeoLocation', () => {
    it.each([
      { latitude: 52.520008, longitude: 13.404954 },
      { latitude: 0, longitude: 0 },
      { latitude: -90, longitude: -180 },
      { latitude: 90, longitude: 180 }
    ])('accepts valid coordinates %p', (geoLocation) => {
      expect(isValidGeoLocation(geoLocation)).toBe(true);
    });

    it.each([
      undefined,
      {},
      { latitude: Number.NaN, longitude: 13 },
      { latitude: 52, longitude: Number.POSITIVE_INFINITY },
      { latitude: -91, longitude: 13 },
      { latitude: 52, longitude: 181 },
      { latitude: '52', longitude: '13' }
    ])('rejects invalid coordinates %p', (geoLocation) => {
      expect(isValidGeoLocation(geoLocation)).toBe(false);
    });
  });

  it('falls back to the postal address when coordinates are invalid', () => {
    const link = locationLink('Musterstra%C3%9Fe%201', {
      latitude: Number.NaN,
      longitude: 13
    });

    expect(link).toContain('Musterstra%C3%9Fe%201');
    expect(link).not.toContain('NaN');
  });
});
