jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    GENERIC_ITEM: 'genericItem',
    VOLUNTEER: { CALENDAR: 'volunteerCalendar', GROUP: 'volunteerGroup' }
  }
}));

jest.mock('../../src/components', () => ({ locationServiceEnabledAlert: jest.fn() }));

import { filterLocationsWithinRadius } from '../../src/helpers/geolocationRadiusFilterHelper';
import { getParticipationProjectGeoLocation } from '../../src/helpers/participationProjectHelper';

describe('filterLocationsWithinRadius', () => {
  it('filters participation projects by their location coordinates', () => {
    const nearbyProject = {
      id: 'nearby',
      locations: [{ geoLocation: { latitude: 52.1, longitude: 11.6 } }]
    };
    const distantProject = {
      id: 'distant',
      locations: [{ geoLocation: { latitude: 53.1, longitude: 12.6 } }]
    };

    expect(filterLocationsWithinRadius([nearbyProject, distantProject], 52.1, 11.6, 1)).toEqual([
      nearbyProject
    ]);
  });

  it('uses a later valid project location just like the participation map', () => {
    const project = {
      id: 'multiple-locations',
      locations: [
        { id: 'without-coordinates' },
        { id: 'with-coordinates', geoLocation: { latitude: 52.1, longitude: 11.6 } }
      ]
    };

    expect(getParticipationProjectGeoLocation(project)).toEqual({
      latitude: 52.1,
      longitude: 11.6
    });
    expect(filterLocationsWithinRadius([project], 52.1, 11.6, 100)).toEqual([project]);
  });

  it('filters parsed participation list items by their detail coordinates', () => {
    const listItem = {
      id: 'participation-list-item',
      params: {
        details: {
          locations: [{ geoLocation: { latitude: 52.13, longitude: 11.62 } }]
        }
      }
    };

    expect(filterLocationsWithinRadius([listItem], 52.13, 11.62, 1)).toEqual([listItem]);
  });
});
