import { print } from 'graphql';

import {
  GET_POINT_OF_INTEREST_REALTIME_TRAVEL_TIMES,
  GET_POINT_OF_INTEREST_TRAVEL_TIMES
} from '../../src/queries/pointsOfInterest';

describe('departure queries', () => {
  it('keeps the default query compatible with scheduled-only backends', () => {
    const query = print(GET_POINT_OF_INTEREST_TRAVEL_TIMES);

    expect(query).toContain('travelTimes(date: $date)');
    expect(query).toContain('departureTime');
    expect(query).not.toMatch(/includeRealtime|estimatedDepartureTime|departureDelaySeconds/);
  });

  it('requests predictions with the realtime query when enabled', () => {
    const query = print(GET_POINT_OF_INTEREST_REALTIME_TRAVEL_TIMES);

    expect(query).toContain('travelTimes(date: $date, includeRealtime: true)');
    expect(query).toContain('departureTime');
    expect(query).toContain('estimatedDepartureTime');
    expect(query).toContain('departureDelaySeconds');
  });
});
