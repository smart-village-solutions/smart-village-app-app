/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

const mockMapLibreUnmountSpy = jest.fn();

jest.mock('../../src/config', () => ({
  consts: {
    MAP: { DEFAULT_PIN: 'defaultPin' }
  },
  normalize: (value: number) => value,
  texts: {
    augmentedReality: {
      filter: {
        listView: 'Listenansicht',
        mapView: 'Kartenansicht'
      }
    },
    tour: {
      stop: 'Stop',
      tour: 'Tourverlauf',
      tourStart: 'Tour starten',
      tourStop: 'Tourstopp'
    }
  }
}));

jest.mock('../../src/hooks', () => ({
  useLastKnownPosition: jest.fn(() => ({ position: null })),
  useLocationSettings: jest.fn(() => ({ locationSettings: { locationService: true } })),
  usePosition: jest.fn(() => ({ position: null })),
  useSystemPermission: jest.fn(() => ({ status: 'granted' }))
}));

jest.mock('../../src/SettingsProvider', () => {
  const React = jest.requireActual('react');

  return {
    SettingsContext: React.createContext({
      globalSettings: {
        settings: {}
      }
    })
  };
});

jest.mock('../../src/types', () => ({
  ScreenName: {
    TourStopDetail: 'TourStopDetail'
  }
}));

jest.mock('../../src/components/augmentedReality', () => ({
  AugmentedReality: () => {
    const React = require('react');
    const ReactNative = require('react-native');

    return <ReactNative.View testID="augmented-reality" />;
  }
}));

jest.mock('../../src/components/Button', () => ({
  Button: ({ onPress, title }: { onPress: () => void; title: string }) => {
    const React = require('react');
    const ReactNative = require('react-native');

    return (
      <ReactNative.TouchableOpacity onPress={onPress} testID={`button-${title}`}>
        <ReactNative.Text>{title}</ReactNative.Text>
      </ReactNative.TouchableOpacity>
    );
  }
}));

jest.mock('../../src/components/IndexFilterWrapperAndList', () => ({
  IndexFilterWrapperAndList: ({
    filter,
    setFilter
  }: {
    filter: { id: string; selected: boolean }[];
    setFilter: (nextFilter: { id: string; selected: boolean }[]) => void;
  }) => {
    const React = require('react');
    const ReactNative = require('react-native');

    return (
      <ReactNative.View>
        <ReactNative.TouchableOpacity
          onPress={() =>
            setFilter(
              filter.map((entry) => ({
                ...entry,
                selected: entry.id === 'listView'
              }))
            )
          }
          testID="filter-list"
        />
        <ReactNative.TouchableOpacity
          onPress={() =>
            setFilter(
              filter.map((entry) => ({
                ...entry,
                selected: entry.id === 'mapView'
              }))
            )
          }
          testID="filter-map"
        />
      </ReactNative.View>
    );
  }
}));

jest.mock('../../src/components/ListComponent', () => ({
  ListComponent: ({ data }: { data: unknown[] }) => {
    const React = require('react');
    const ReactNative = require('react-native');

    return <ReactNative.View data-count={data.length} testID="list" />;
  }
}));

jest.mock('../../src/components/map', () => {
  const React = require('react');
  const ReactNative = require('react-native');

  const MockMapLibre = (props: Record<string, unknown>) => {
    React.useEffect(() => () => mockMapLibreUnmountSpy(), []);

    return <ReactNative.View {...props} testID="map" />;
  };

  return {
    MapLibre: MockMapLibre
  };
});

jest.mock('../../src/components/SectionHeader', () => ({
  SectionHeader: ({ title }: { title: string }) => {
    const React = require('react');
    const ReactNative = require('react-native');

    return <ReactNative.Text>{title}</ReactNative.Text>;
  }
}));

jest.mock('../../src/components/SUE/report/SueReportLocation', () => ({
  locationServiceEnabledAlert: jest.fn()
}));

jest.mock('../../src/components/Wrapper', () => ({
  Wrapper: ({ children }: { children: React.ReactNode }) => {
    const React = require('react');
    const ReactNative = require('react-native');

    return <ReactNative.View>{children}</ReactNative.View>;
  }
}));

import { TourStops } from '../../src/components/TourStops';

describe('TourStops', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the map mounted when switching between list and map view', () => {
    const navigation = { navigate: jest.fn() };
    const tourStops = [
      {
        id: 1,
        location: {
          geoLocation: {
            latitude: 52.52,
            longitude: 13.405
          }
        },
        title: 'Stop 1'
      },
      {
        id: 2,
        location: {
          geoLocation: {
            latitude: 52.53,
            longitude: 13.41
          }
        },
        title: 'Stop 2'
      }
    ];

    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <TourStops
          geometryTourData={[]}
          id={1}
          navigation={navigation}
          rootRouteName="Tour"
          tourStops={tourStops}
        />
      );
    });

    expect(component!.root.findAll((node) => node.props.testID === 'map').length).toBeGreaterThan(
      0
    );

    act(() => {
      component!.root.findByProps({ testID: 'filter-list' }).props.onPress();
    });

    expect(component!.root.findAll((node) => node.props.testID === 'map').length).toBeGreaterThan(
      0
    );
    expect(component!.root.findAll((node) => node.props.testID === 'list').length).toBeGreaterThan(
      0
    );
    expect(mockMapLibreUnmountSpy).not.toHaveBeenCalled();

    act(() => {
      component!.root.findByProps({ testID: 'filter-map' }).props.onPress();
    });

    expect(component!.root.findAll((node) => node.props.testID === 'map').length).toBeGreaterThan(
      0
    );
    expect(mockMapLibreUnmountSpy).not.toHaveBeenCalled();
  });
});
