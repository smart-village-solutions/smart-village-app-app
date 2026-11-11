import {
  getPointOfInterestMapCategoryIds,
  getPointOfInterestMapMarkers
} from '../../../src/components/screens/pointOfInterestMapHelper';

describe('point of interest detail map', () => {
  it('uses the opened subcategory when available and never substitutes the primary category', () => {
    const categories = [
      { id: 'park', name: 'Parks' },
      { id: 'museum', name: 'Museums' }
    ];

    expect(getPointOfInterestMapCategoryIds(categories, 'Museums')).toEqual(['museum']);
    expect(getPointOfInterestMapCategoryIds(categories, undefined)).toEqual(['park', 'museum']);
  });

  it('keeps the opened POI first and includes only published peers with valid coordinates', () => {
    const current = {
      id: 'current',
      iconName: 'pin',
      position: { latitude: 52, longitude: 13 }
    };
    const related = [
      {
        id: 'other',
        name: 'Other POI',
        visible: true,
        category: { iconName: 'museum' },
        addresses: [{ geoLocation: { latitude: 52.1, longitude: 13.1 } }]
      },
      {
        id: 'current',
        visible: true,
        addresses: [{ geoLocation: { latitude: 52, longitude: 13 } }]
      },
      {
        id: 'hidden',
        visible: false,
        addresses: [{ geoLocation: { latitude: 52, longitude: 14 } }]
      },
      {
        id: 'invalid',
        visible: true,
        addresses: [{ geoLocation: { latitude: 100, longitude: 14 } }]
      }
    ];

    expect(getPointOfInterestMapMarkers(current, related)).toEqual([
      current,
      {
        museum: 1,
        id: 'other',
        title: 'Other POI',
        iconName: 'museum',
        activeIconName: 'museumActive',
        position: { latitude: 52.1, longitude: 13.1 }
      }
    ]);
    expect(getPointOfInterestMapMarkers(current, undefined)).toEqual([current]);
  });
});
