/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ParticipationProjectMapScreen } from '../../src/screens/ParticipationProject/ParticipationProjectMapScreen';
import { ScreenName } from '../../src/types';

const DETAIL_ROUTE_NAME = 'Detail';

jest.mock('react-query', () => ({
  useQuery: jest.fn()
}));

jest.mock('../../src/ReactQueryClient', () => ({
  ReactQueryClient: jest.fn()
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    GENERIC_ITEMS: 'genericItems'
  },
  getQuery: jest.fn()
}));

jest.mock('../../src/helpers', () => ({
  buildParticipationProjectPreviewItem: jest.fn((item, options) => ({
    accessibilityLabel: `${item.title} button`,
    bottomDivider: false,
    id: item.id,
    params: {
      details: item,
      query: 'genericItem',
      queryVariables: { id: item.id },
      rootRouteName: options?.rootRouteName,
      title: 'Beteiligungsprojekt'
    },
    picture: { url: 'https://example.com/image.jpg' },
    routeName: DETAIL_ROUTE_NAME,
    subtitle: 'Kurzbeschreibung',
    title: item.title
  })),
  getParticipationProjectGeoLocation: jest.fn(
    (item) => item.locations?.[0]?.geoLocation || item.addresses?.[0]?.geoLocation
  ),
  isParticipationProjectMapEligible: jest.fn(
    (item) => !!(item.locations?.[0]?.geoLocation || item.addresses?.[0]?.geoLocation)
  )
}));

const mockMapLibre = jest.fn();

jest.mock('../../src/components', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    HeaderLeft: ({ onPress }) => (
      <Text testID="header-left" onPress={onPress}>
        close
      </Text>
    ),
    LoadingSpinner: () => <Text>loading</Text>,
    MapLibre: (props) => {
      mockMapLibre(props);

      return <View testID="maplibre" />;
    },
    RegularText: ({ children }) => <Text>{children}</Text>,
    TextListItem: ({ item, navigation }) => (
      <Text testID="preview-card" onPress={() => navigation.navigate(item.routeName, item.params)}>
        {item.title}
      </Text>
    ),
    Wrapper: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    shadowRgba: 'rgba(0,0,0,0.2)',
    surface: '#ffffff'
  },
  consts: {
    MAP: {
      DEFAULT_PIN: 'defaultPin'
    }
  },
  Icon: {
    Close: () => null
  },
  normalize: (value: number) => value,
  texts: {
    locationOverview: {
      map: 'Kartenansicht'
    }
  }
}));

const { useQuery } = jest.requireMock('react-query') as {
  useQuery: jest.Mock;
};

const buildItem = ({
  id,
  position,
  status
}: {
  id: string;
  position?: { latitude: number; longitude: number };
  status?: string;
}) => ({
  id,
  locations: position ? [{ geoLocation: position }] : [],
  payload: { status },
  title: `Projekt ${id}`
});

describe('ParticipationProjectMapScreen', () => {
  beforeEach(() => {
    mockMapLibre.mockReset();
    useQuery.mockReset();
  });

  it('renders markers only for active items with geo coordinates and opens the detail preview', () => {
    useQuery.mockReturnValue({
      data: {
        genericItems: [
          buildItem({
            id: 'active-1',
            position: { latitude: 52.1, longitude: 11.6 }
          }),
          buildItem({
            id: 'inactive-1',
            position: { latitude: 52.2, longitude: 11.7 },
            status: 'Inaktiv'
          }),
          buildItem({
            id: 'active-without-geo',
            status: 'Aktiv'
          })
        ]
      },
      isLoading: false
    });

    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      setOptions: jest.fn()
    };

    const route = {
      params: {
        queryVariables: { categoryId: '7' },
        rootRouteName: 'participation-projects',
        title: 'Aktive Projekte'
      }
    };

    const screen = render(
      <ParticipationProjectMapScreen navigation={navigation as never} route={route as never} />
    );

    expect(screen.getByTestId('maplibre')).toBeTruthy();
    expect(mockMapLibre).toHaveBeenCalledWith(
      expect.objectContaining({
        locations: [
          expect.objectContaining({
            activeIconName: 'defaultPinActive',
            iconName: 'defaultPin',
            id: 'active-1'
          }),
          expect.objectContaining({
            activeIconName: 'defaultPinActive',
            iconName: 'defaultPin',
            id: 'inactive-1'
          })
        ],
        selectedMarker: undefined
      })
    );

    act(() => {
      mockMapLibre.mock.calls[0][0].onMarkerPress('active-1');
    });

    expect(screen.getByText('Projekt active-1')).toBeTruthy();
    fireEvent.press(screen.getByTestId('preview-card'));

    expect(navigation.navigate).toHaveBeenCalledWith(ScreenName.Detail, {
      details: expect.objectContaining({ id: 'active-1' }),
      query: 'genericItem',
      queryVariables: { id: 'active-1' },
      rootRouteName: 'participation-projects',
      title: 'Beteiligungsprojekt'
    });
  });

  it('renders the empty state and wires the close button to goBack', () => {
    useQuery.mockReturnValue({
      data: {
        genericItems: [buildItem({ id: 'without-geo', status: 'Inaktiv' })]
      },
      isLoading: false
    });

    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      setOptions: jest.fn()
    };

    const screen = render(
      <ParticipationProjectMapScreen
        navigation={navigation as never}
        route={{ params: { title: 'Kartenansicht' } } as never}
      />
    );

    const options = navigation.setOptions.mock.calls[0][0];
    const { getByTestId } = render(options.headerLeft());

    expect(options.title).toBe('Kartenansicht');
    expect(
      screen.getByText('Keine aktiven Beteiligungsprojekte mit Standort verfuegbar.')
    ).toBeTruthy();

    fireEvent.press(getByTestId('header-left'));
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});
