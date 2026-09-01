import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import renderer, { act, ReactTestRenderer } from 'react-test-renderer';

import { AddressSection } from '../../src/components/infoCard/AddressSection';
import { texts } from '../../src/config/texts';
import { openLink } from '../../src/helpers';

jest.mock('../../src/helpers', () => ({
  ...jest.requireActual('../../src/helpers/addressHelper'),
  ...jest.requireActual('../../src/helpers/mapHelper'),
  openLink: jest.fn()
}));

jest.mock('../../src/config', () => ({
  colors: { placeholder: '#999999', primary: '#0000ff' },
  consts: {
    a11yLabel: {
      address: '(Adresse)',
      button: '(Taste)',
      mapHint: '(Wechselt zur Karten-App)'
    }
  },
  Icon: { Flag: () => null, RoutePlanner: () => null },
  normalize: (value: number) => value,
  texts: jest.requireActual('../../src/config/texts').texts
}));

jest.mock('../../src/hooks', () => ({
  useLastKnownPosition: () => ({ position: undefined }),
  usePosition: () => ({ position: undefined })
}));

jest.mock('react-native-elements', () => ({ Divider: () => null }));

const mockedOpenLink = openLink as jest.MockedFunction<typeof openLink>;

const renderAddressSection = (props: React.ComponentProps<typeof AddressSection>) => {
  let component: ReactTestRenderer;

  act(() => {
    component = renderer.create(<AddressSection {...props} />);
  });

  return component!;
};

const renderedText = (component: ReactTestRenderer) =>
  component.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .join(' ');

describe('AddressSection navigation', () => {
  beforeEach(() => {
    mockedOpenLink.mockClear();
  });

  it('keeps a postal address as the navigation entry when coordinates are present', () => {
    const component = renderAddressSection({
      addresses: [
        {
          city: 'Musterstadt',
          geoLocation: { latitude: 52.520008, longitude: 13.404954 },
          kind: 'default',
          street: 'Musterstraße 1',
          zip: '12345'
        }
      ]
    });

    expect(renderedText(component)).toContain('Musterstraße 1, 12345 Musterstadt');
    expect(renderedText(component)).not.toContain(texts.pointOfInterest.navigationWithoutAddress);

    act(() => {
      component.root.findByType(TouchableOpacity).props.onPress();
    });

    expect(mockedOpenLink).toHaveBeenCalledTimes(1);
    expect(mockedOpenLink.mock.calls[0][0]).toContain('52.520008,13.404954');
  });

  it.each([
    [
      'manually maintained coordinate-only data',
      {
        geoLocation: { latitude: 52.520008, longitude: 13.404954 },
        kind: 'default'
      }
    ],
    [
      'imported city-only data',
      {
        city: 'Lenzen',
        geoLocation: { latitude: 53.1098265234947, longitude: 11.5412549351836 },
        kind: 'default'
      }
    ],
    [
      'imported postal-code-and-city data without a street',
      {
        city: 'Bad Wilsnack',
        geoLocation: { latitude: 52.961342633488, longitude: 11.951428355067 },
        kind: 'default',
        zip: '19336'
      }
    ],
    [
      'imported descriptive location data without a street',
      {
        addition: 'Beobachtungsturm A',
        city: 'Lenzen (Elbe) OT Rambow',
        geoLocation: { latitude: 53.146268190588, longitude: 11.581361180318 },
        kind: 'default',
        zip: '19309'
      }
    ]
  ])('shows an accessible route action for %s', (_, address) => {
    const component = renderAddressSection({
      addresses: [address],
      title: 'POI ohne Adresse'
    });
    const routeAction = component.root.findByType(TouchableOpacity);

    expect(texts.pointOfInterest.navigationWithoutAddress).toBe('Route planen');
    expect(renderedText(component)).toContain(texts.pointOfInterest.navigationWithoutAddress);
    expect(routeAction.props.accessibilityLabel).toContain(
      texts.pointOfInterest.navigationWithoutAddress
    );
    expect(routeAction.props.accessibilityLabel).not.toContain('(Adresse)');
    expect(routeAction.props.accessibilityRole).toBe('button');
    expect(routeAction.props.accessible).toBe(true);
    expect(routeAction.props.focusable).toBe(true);

    act(() => {
      routeAction.props.onPress();
    });

    expect(mockedOpenLink).toHaveBeenCalledTimes(1);
    expect(mockedOpenLink.mock.calls[0][0]).toContain(
      `${address.geoLocation.latitude},${address.geoLocation.longitude}`
    );
  });

  it('keeps a concrete postal address as the navigation entry without coordinates', () => {
    const component = renderAddressSection({
      addresses: [
        {
          city: 'Musterstadt',
          kind: 'default',
          street: 'Musterstraße 1',
          zip: '12345'
        }
      ]
    });
    const addressAction = component.root.findByType(TouchableOpacity);

    expect(renderedText(component)).toContain('Musterstraße 1, 12345 Musterstadt');
    expect(renderedText(component)).not.toContain(texts.pointOfInterest.navigationWithoutAddress);

    act(() => {
      addressAction.props.onPress();
    });

    expect(mockedOpenLink).toHaveBeenCalledTimes(1);
    expect(mockedOpenLink.mock.calls[0][0]).toContain('12345%20Musterstadt');
  });

  it.each([
    ['missing', { city: 'Lenzen', kind: 'default' }],
    [
      'out of range',
      {
        city: 'Lenzen',
        geoLocation: { latitude: 91, longitude: 181 },
        kind: 'default'
      }
    ],
    [
      'non-finite',
      {
        city: 'Lenzen',
        geoLocation: { latitude: Number.NaN, longitude: 13.404954 },
        kind: 'default'
      }
    ]
  ])(
    'does not show a navigation action for non-concrete location data with %s coordinates',
    (_, address) => {
      const component = renderAddressSection({
        addresses: [address]
      });

      expect(component.root.findAllByType(TouchableOpacity)).toHaveLength(0);
      expect(renderedText(component)).not.toContain(texts.pointOfInterest.navigationWithoutAddress);
      expect(mockedOpenLink).not.toHaveBeenCalled();
    }
  );
});
