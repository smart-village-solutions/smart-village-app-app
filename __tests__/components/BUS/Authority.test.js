/* eslint-disable react/prop-types */
import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { Authority } from '../../../src/components/BUS/Authority';

jest.mock('../../../src/config', () => ({
  texts: {
    bus: {
      authority: {
        accessibility: 'Barrierefreiheit',
        elevator: 'Aufzug vorhanden',
        openingTime: 'Öffnungszeiten',
        paymentMethod: 'Zahlungsweise',
        paymentMethods: 'Zahlungsdaten',
        transportation: 'Verkehrsanbindung',
        wheelchairAccessible: 'Rollstuhlgerecht'
      }
    }
  }
}));

jest.mock('../../../src/helpers', () => ({
  trimNewLines: (value) => value
}));

jest.mock('../../../src/components/HtmlView', () => ({
  HtmlView: ({ html }) => {
    const { Text: MockText } = jest.requireActual('react-native');

    return <MockText>{html}</MockText>;
  }
}));

jest.mock('../../../src/components/infoCard', () => ({
  InfoCard: () => {
    const { View: MockView } = jest.requireActual('react-native');

    return <MockView />;
  }
}));

jest.mock('../../../src/components/Text', () => ({
  BoldText: ({ children }) => {
    const { Text: MockText } = jest.requireActual('react-native');

    return <MockText>{children}</MockText>;
  },
  RegularText: ({ children }) => {
    const { Text: MockText } = jest.requireActual('react-native');

    return <MockText>{children}</MockText>;
  }
}));

jest.mock('../../../src/components/Wrapper', () => ({
  Wrapper: ({ children }) => {
    const { View: MockView } = jest.requireActual('react-native');

    return <MockView>{children}</MockView>;
  }
}));

jest.mock('../../../src/components/BUS/Block', () => ({
  Block: ({ children }) => {
    const { View: MockView } = jest.requireActual('react-native');

    return <MockView>{children}</MockView>;
  }
}));

const collectText = (children) => {
  if (typeof children === 'string') {
    return children;
  }

  if (Array.isArray(children)) {
    return children.map(collectText).join('');
  }

  return '';
};

describe('Authority', () => {
  it('renders transportation stops alongside accessibility details', () => {
    let component;

    act(() => {
      component = renderer.create(
        <Authority
          bottomDivider={false}
          openWebScreen={jest.fn()}
          data={{
            name: 'Buergeramt',
            addresses: [
              {
                area: { name: 'Perleberg' },
                elevator: true,
                transportationStops: [
                  {
                    name: 'Perleberg, Landkreis',
                    lines: [{ name: '975', type: { key: 'BUS', name: 'Bus' } }]
                  },
                  {
                    name: 'Perleberg, Landkreis',
                    lines: [{ name: '950', type: { key: 'BUS', name: 'Bus' } }]
                  }
                ],
                wheelchairAccessible: true
              }
            ],
            paymentMethods: [
              {
                id: '100006331',
                key: '3010000',
                name: 'Überweisung',
                notPublic: false
              },
              {
                id: '100058904',
                key: '3000000',
                name: 'Bargeldlose Zahlung',
                notPublic: false
              }
            ]
          }}
        />
      );
    });

    const textValues = component.root
      .findAllByType(Text)
      .map((node) => collectText(node.props.children));

    expect(textValues).toEqual(
      expect.arrayContaining([
        'Verkehrsanbindung',
        'Perleberg, Landkreis',
        'Bus: 975',
        'Bus: 950',
        'Barrierefreiheit',
        'Aufzug vorhanden: ja',
        'Rollstuhlgerecht: ja',
        'Zahlungsdaten',
        'Zahlungsweise:',
        'Überweisung',
        'Bargeldlose Zahlung'
      ])
    );
  });
});
