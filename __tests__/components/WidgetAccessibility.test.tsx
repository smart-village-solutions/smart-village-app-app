import { useNavigation } from '@react-navigation/core';
import React from 'react';
import { render } from '@testing-library/react-native';
import { useQuery } from 'react-apollo';
import { TouchableOpacity } from 'react-native';

import { CustomWidget } from '../../src/components/widgets/CustomWidget';
import { DefaultWidget } from '../../src/components/widgets/DefaultWidget';
import { WeatherWidget } from '../../src/components/widgets/WeatherWidget';
import { WebWidget } from '../../src/components/widgets/WebWidget';

jest.mock('@react-navigation/core', () => ({
  useNavigation: jest.fn()
}));

jest.mock('react-apollo', () => ({
  useQuery: jest.fn()
}));

jest.mock('../../src/config', () => ({
  consts: {
    a11yLabel: {
      button: '(Taste)'
    },
    POLL_INTERVALS: {
      WEATHER: 3600000
    }
  },
  Icon: {
    NamedIcon: () => null,
    Url: () => null
  },
  normalize: (value: number) => value,
  texts: {
    screenTitles: {
      weather: 'Wetter'
    },
    widgets: {
      custom: 'Custom',
      weather: 'Wetter'
    }
  }
}));

jest.mock('../../src/components/Image', () => ({
  Image: () => null
}));

jest.mock('../../src/components/Text', () => ({
  BoldText: ({ children }: { children?: React.ReactNode }) => children,
  RegularText: ({ children }: { children?: React.ReactNode }) => children
}));

jest.mock('../../src/components/Wrapper', () => ({
  WrapperRow: ({ children }: { children?: React.ReactNode }) => children,
  WrapperVertical: ({ children }: { children?: React.ReactNode }) => children
}));

jest.mock('../../src/helpers', () => ({
  graphqlFetchPolicy: () => 'cache-first',
  normalizeStyleValues: (value: unknown) => value
}));

jest.mock('../../src/hooks', () => ({
  useHomeRefresh: () => {}
}));

jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: require('react').createContext({
    isConnected: true,
    isMainserverUp: true
  })
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    WEATHER_MAP_CURRENT: 'WEATHER_MAP_CURRENT'
  },
  getQuery: () => 'WEATHER_QUERY'
}));

describe('Widget accessibility labels', () => {
  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue({ navigate: jest.fn() });
    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      refetch: jest.fn()
    });
  });

  it('uses the widget title when no explicit accessibility label is provided', () => {
    const { UNSAFE_getByType } = render(<DefaultWidget Icon={() => null} onPress={() => {}} text="Wetter" />);

    expect(UNSAFE_getByType(TouchableOpacity).props.accessibilityLabel).toBe('Wetter (Taste)');
  });

  it('prefers an explicit accessibility label on default widgets', () => {
    const { UNSAFE_getByType } = render(
      <DefaultWidget
        accessibilityLabel="Gehe zu Wetter"
        Icon={() => null}
        onPress={() => {}}
        text="Wetter"
      />
    );

    expect(UNSAFE_getByType(TouchableOpacity).props.accessibilityLabel).toBe(
      'Gehe zu Wetter (Taste)'
    );
  });

  it('describes external web widgets with their target host', () => {
    const { UNSAFE_getByType } = render(
      <WebWidget additionalProps={{ webUrl: 'https://www.magdeburg.de' }} text="Website" />
    );

    expect(UNSAFE_getByType(TouchableOpacity).props.accessibilityLabel).toBe(
      'Gehe zu magdeburg.de (Taste)'
    );
  });

  it('describes weather widgets with current value and destination', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        weatherMap: {
          current: {
            temp: 19.2,
            weather: [{ description: 'leicht bewölkt', icon: '02d' }]
          }
        }
      },
      refetch: jest.fn()
    });

    const { UNSAFE_getByType } = render(<WeatherWidget text="Wetter" />);

    expect(UNSAFE_getByType(TouchableOpacity).props.accessibilityLabel).toBe(
      'Wetter (Aktuell 19 °C) (Gehe zur Wetterübersicht) (Taste)'
    );
  });

  it('merges custom widget label text with an explicit destination label', () => {
    const { UNSAFE_getByType } = render(
      <CustomWidget
        additionalProps={{
          accessibilityActionLabel: 'Gehe zum Beteiligungsportal',
          accessibilityLabel: 'Beteiligung',
          routeName: 'Web'
        }}
        text="Beteiligung"
      />
    );

    expect(UNSAFE_getByType(TouchableOpacity).props.accessibilityLabel).toBe(
      'Beteiligung (Gehe zum Beteiligungsportal) (Taste)'
    );
  });
});
