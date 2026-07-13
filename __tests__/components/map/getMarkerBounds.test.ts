import { getMarkerBounds } from '../../../src/components/map/getMarkerBounds';

describe('getMarkerBounds', () => {
  it('returns geographic extremes in west, south, east, north order', () => {
    expect(
      getMarkerBounds([
        { id: '1', position: { latitude: 52.6, longitude: 13.2 } },
        { id: '2', position: { latitude: 52.4, longitude: 13.8 } },
        { id: '3', position: { latitude: 52.5, longitude: 13.4 } }
      ])
    ).toEqual([13.2, 52.4, 13.8, 52.6]);
  });

  it('returns undefined for fewer than two valid markers', () => {
    expect(getMarkerBounds([])).toBeUndefined();
    expect(
      getMarkerBounds([
        { id: '1', position: { latitude: 52.6, longitude: 13.2 } },
        { id: '2', position: { latitude: Number.NaN, longitude: 13.8 } },
        { id: '3', position: { latitude: 91, longitude: 13.8 } }
      ])
    ).toBeUndefined();
  });
});
