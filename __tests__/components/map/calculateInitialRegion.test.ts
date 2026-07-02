import { calculateInitialRegion } from '../../../src/components/map/calculateInitialRegion';

describe('calculateInitialRegion', () => {
  it('prefers the explicit map center over the user position for multi-marker maps', () => {
    expect(
      calculateInitialRegion({
        currentPosition: {
          coords: {
            latitude: 52.52,
            longitude: 13.405
          }
        },
        isMultipleMarkersMap: true,
        locations: [
          {
            id: '1',
            position: {
              latitude: 48.137,
              longitude: 11.575
            }
          },
          {
            id: '2',
            position: {
              latitude: 48.14,
              longitude: 11.58
            }
          }
        ],
        mapCenterPosition: {
          latitude: 48.138,
          longitude: 11.577
        },
        showsUserLocation: true
      })
    ).toEqual({
      latitude: 48.138,
      longitude: 11.577
    });
  });
});
