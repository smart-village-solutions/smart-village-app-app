import { expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { useQuery } from 'react-apollo';

import { lightColors } from '../../src/config/colors';
import { getQuery } from '../../src/queries';
import { TravelTimes } from '../../src/components/screens/TravelTimes';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';

jest.mock('react-apollo', () => ({ useQuery: jest.fn() }));
jest.mock('../../src/config', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Icon: { ArrowRight2: () => null },
    IconUrl: ({ iconName, color }: { iconName: string; color: string }) => (
      <Text style={{ color }}>{iconName}.svg</Text>
    ),
    normalize: (value: number) => value,
    texts: {
      pointOfInterest: {
        departureDeviation:
          jest.requireActual<typeof import('../../src/config/texts')>('../../src/config/texts')
            .texts.pointOfInterest.departureDeviation,
        departureTimes: 'Abfahrtszeiten',
        today: 'Heute',
        routeTypes: { tram: 'Straßenbahn', metro: 'U-Bahn', railway: 'Bahn', bus: 'Bus' }
      }
    }
  };
});
jest.mock('../../src/helpers', () => ({
  momentFormat: (value: string) => value,
  normalizeTime: (value: string) => value
}));
jest.mock('../../src/hooks', () => ({ useDetailRefresh: jest.fn() }));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: { POINT_OF_INTEREST_TRAVEL_TIMES: 'travelTimes' },
  getQuery: jest.fn()
}));
jest.mock('../../src/components/Button', () => ({ Button: () => null }));
jest.mock('../../src/components/SectionHeader', () => ({ SectionHeader: () => null }));
jest.mock('../../src/components/Wrapper', () => ({
  Wrapper: jest.requireActual<typeof import('react-native')>('react-native').View
}));
jest.mock('../../src/components/Text', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');

  return { BoldText: Text, HeadlineText: Text, RegularText: Text };
});

const departure = (routeType: string, routeShortName: string) => ({
  departureTime: '10:30:00',
  route: { routeType, routeShortName },
  trip: { tripHeadsign: 'Senftenberg' }
});

it('shows predicted times and highlights only nonzero deviations when realtime is enabled', async () => {
  jest.mocked(useQuery).mockReturnValue({
    data: {
      pointOfInterest: {
        travelTimes: [
          {
            ...departure('3', '12'),
            estimatedDepartureTime: '10:35:00',
            departureDelaySeconds: 300
          },
          {
            ...departure('700', '620'),
            estimatedDepartureTime: '10:27:00',
            departureDelaySeconds: -180
          },
          {
            ...departure('100', 'RE7'),
            estimatedDepartureTime: '10:30:00',
            departureDelaySeconds: 0
          },
          departure('3', '14')
        ]
      }
    },
    loading: false,
    refetch: jest.fn()
  } as unknown as ReturnType<typeof useQuery>);

  await render(
    <SettingsContext.Provider
      value={{
        ...initialContext,
        globalSettings: {
          ...initialContext.globalSettings,
          settings: { travelTimesRealtime: true }
        }
      }}
    >
      <TravelTimes id="123" />
    </SettingsContext.Provider>
  );

  expect(getQuery).toHaveBeenLastCalledWith('travelTimes', { travelTimesRealtime: true });
  expect(useQuery).toHaveBeenLastCalledWith(
    undefined,
    expect.objectContaining({ fetchPolicy: 'network-only' })
  );
  expect(screen.getByText('10:35:00')).toBeTruthy();
  expect(screen.getByText('10:27:00')).toBeTruthy();
  expect(screen.getAllByText('10:30:00')).toHaveLength(2);
  expect(screen.getByText('+5 Min.')).toHaveStyle({ color: lightColors.error });
  expect(screen.getByText('−3 Min.')).toHaveStyle({ color: lightColors.calendarTodayText });
  expect(screen.getByLabelText('5 Minuten später')).toBeTruthy();
  expect(screen.getByLabelText('3 Minuten früher')).toBeTruthy();
  expect(screen.getAllByText(/Min\./)).toHaveLength(2);
});
