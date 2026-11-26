jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    GENERIC_ITEM: 'genericItem',
    VOLUNTEER: { CALENDAR: 'volunteerCalendar', GROUP: 'volunteerGroup' }
  }
}));

jest.mock('../../src/components', () => ({ locationServiceEnabledAlert: jest.fn() }));
jest.mock('../../src/config', () => ({
  ...jest.requireActual('../../src/config/consts'),
  ...jest.requireActual('../../src/config/texts')
}));

import type { LocationObject } from 'expo-location';

import { locationServiceEnabledAlert } from '../../src/components';
import {
  filterLocationsWithinRadius,
  geoLocationFilteredListItem
} from '../../src/helpers/geolocationRadiusFilterHelper';
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

describe('reference position for radius searches', () => {
  const nearby = { id: 'nearby', locations: [{ geoLocation: { latitude: 0, longitude: 0 } }] };
  const distant = { id: 'distant', locations: [{ geoLocation: { latitude: 50, longitude: 10 } }] };
  const position = { coords: { latitude: 0, longitude: 0 } };
  const props = {
    listItem: [nearby, distant],
    isLocationAlertShow: false,
    navigation: {},
    queryVariables: { radiusSearch: { currentPosition: true, distance: 10 } },
    setIsLocationAlertShow: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  test.each(['alternativePosition', 'defaultAlternativePosition'])(
    '%s works without GPS permission, including zero coordinates',
    (key) => {
      expect(
        geoLocationFilteredListItem({
          ...props,
          locationSettings: { locationService: false, [key]: position }
        })
      ).toEqual([nearby]);
      expect(locationServiceEnabledAlert).not.toHaveBeenCalled();
    }
  );

  test('enabled GPS takes priority over a stored fallback', () => {
    expect(
      geoLocationFilteredListItem({
        ...props,
        currentPosition: position as LocationObject,
        locationSettings: {
          locationService: true,
          alternativePosition: { coords: { latitude: 50, longitude: 10 } }
        }
      })
    ).toEqual([nearby]);
  });

  test('missing GPS does not silently apply the saved alternative and only alerts once', () => {
    const search = {
      ...props,
      locationSettings: { locationService: true, alternativePosition: position }
    };
    expect(geoLocationFilteredListItem(search)).toBe(props.listItem);
    expect(locationServiceEnabledAlert).toHaveBeenCalledTimes(1);
    expect(geoLocationFilteredListItem({ ...search, isLocationAlertShow: true })).toBe(
      props.listItem
    );
    expect(locationServiceEnabledAlert).toHaveBeenCalledTimes(1);
  });
});
