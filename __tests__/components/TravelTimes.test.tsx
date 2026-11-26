import { beforeEach, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { useQuery } from 'react-apollo';

import { TravelTimes } from '../../src/components/screens/TravelTimes';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';

jest.mock('react-apollo', () => ({ useQuery: jest.fn() }));
jest.mock('../../src/config', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Icon: { ArrowRight2: () => null },
    IconUrl: ({ iconName }: { iconName: string }) => <Text>{iconName}.svg</Text>,
    normalize: (value: number) => value,
    texts: {
      pointOfInterest: {
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

beforeEach(() => {
  jest.mocked(useQuery).mockReturnValue({
    data: {
      pointOfInterest: {
        travelTimes: [departure('3', '12'), departure('700', '620'), departure('100', 'RE7')]
      }
    },
    loading: false,
    refetch: jest.fn()
  } as unknown as ReturnType<typeof useQuery>);
});

it('keeps the standard presentation and shows the line number for unknown types', async () => {
  await render(<TravelTimes id="123" />);

  expect(screen.getByText('bus.svg')).toBeTruthy();
  expect(screen.getByText('Bus 12')).toBeTruthy();
  expect(screen.getByText('620')).toBeTruthy();
  expect(screen.getByText('RE7')).toBeTruthy();
});

it('uses the route presentation from globalSettings for extended GTFS types', async () => {
  await render(
    <SettingsContext.Provider
      value={{
        ...initialContext,
        globalSettings: {
          ...initialContext.globalSettings,
          settings: {
            icons: {
              routeTypes: {
                '700': { icon: 'bus', label: 'Bus', color: '#265BA4' },
                '100': { icon: 'train' }
              }
            }
          }
        }
      }}
    >
      <TravelTimes id="123" />
    </SettingsContext.Provider>
  );

  expect(screen.getAllByText('bus.svg')).toHaveLength(2);
  expect(screen.getByText('Bus 620')).toBeTruthy();
  expect(screen.getByText('train.svg')).toBeTruthy();
  expect(screen.getByText('RE7')).toBeTruthy();
});
