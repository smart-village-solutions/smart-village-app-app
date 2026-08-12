/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, Text, View } from 'react-native';

import { TextListItem } from '../../src/components/TextListItem';
import type { ItemData } from '../../src/components/TextListItem';

jest.mock('../../src/helpers', () => ({
  isOpen: jest.fn(() => ({ open: false })),
  trimNewLines: jest.fn((value) => value)
}));

jest.mock('react-native-elements', () => {
  const React = require('react');
  const { View } = require('react-native');
  const ListItem = ({ children, accessibilityLabel }) => (
    <View accessibilityLabel={accessibilityLabel}>{children}</View>
  );

  ListItem.Content = ({ children }) => <View>{children}</View>;

  return { ListItem };
});

jest.mock('../../src/config', () => ({
  colors: {
    darkText: '#111111',
    transparent: 'transparent'
  },
  consts: {
    a11yLabel: {
      button: 'Taste'
    }
  },
  Icon: {
    ArrowRight: () => null
  },
  normalize: (value: number) => value,
  texts: {
    participationProject: {
      status: 'Status'
    }
  }
}));

jest.mock('../../src/components/Image', () => ({ Image: () => null }));
jest.mock('../../src/components/Touchable', () => {
  const React = require('react');
  const { TouchableOpacity } = require('react-native');

  return { Touchable: (props) => <TouchableOpacity {...props} /> };
});
jest.mock('../../src/components/Text', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockText = ({ children, ...props }) => <Text {...props}>{children}</Text>;

  return { BoldText: MockText, HeadlineText: MockText, RegularText: MockText };
});
jest.mock('../../src/components/Wrapper', () => {
  const React = require('react');
  const { View } = require('react-native');

  return { WrapperRow: ({ children, ...props }) => <View {...props}>{children}</View> };
});

const buildItem = (statusPosition: 'belowTeaser' | 'replaceTeaser'): ItemData => ({
  id: `participation-${statusPosition}`,
  params: {},
  overtitle: '19.08.2026 | Veranstaltung',
  routeName: 'Detail',
  statusColor: 'green',
  statusLabel: 'Aktiv',
  statusPosition,
  subtitle: 'Teaser der Beteiligung',
  title: 'Beteiligung zum Stadtpark'
});

const expectStatusBetweenOvertitleAndTitle = (screen: ReturnType<typeof render>) => {
  const renderedTexts = screen.UNSAFE_getAllByType(Text).map((text) => text.props.children);
  const overtitleIndex = renderedTexts.indexOf('19.08.2026 | Veranstaltung');
  const statusIndex = renderedTexts.indexOf('Aktiv');
  const titleIndex = renderedTexts.indexOf('Beteiligung zum Stadtpark');

  expect(overtitleIndex).toBeLessThan(statusIndex);
  expect(statusIndex).toBeLessThan(titleIndex);
};

describe('Participation Project list status variants', () => {
  it('replaces the teaser with the API status in the replacement variant', () => {
    const screen = render(
      <TextListItem item={buildItem('replaceTeaser')} navigation={{ push: jest.fn() } as never} />
    );

    expect(screen.queryByText('Teaser der Beteiligung')).toBeNull();
    expect(screen.getByText('Aktiv')).toBeTruthy();
    expect(screen.getByLabelText('Status: Aktiv')).toBeTruthy();
    expectStatusBetweenOvertitleAndTitle(screen);
  });

  it('keeps the teaser while rendering the API status between overtitle and title', () => {
    const screen = render(
      <TextListItem item={buildItem('belowTeaser')} navigation={{ push: jest.fn() } as never} />
    );

    expect(screen.getByText('Teaser der Beteiligung')).toBeTruthy();
    expect(screen.getByText('Aktiv')).toBeTruthy();
    expectStatusBetweenOvertitleAndTitle(screen);
    const statusDotStyle = screen
      .UNSAFE_getAllByType(View)
      .map((view) => StyleSheet.flatten(view.props.style))
      .find((style) => style?.backgroundColor === 'green');

    expect(statusDotStyle).toMatchObject({
      borderColor: '#111111',
      height: 12,
      width: 12
    });
  });
});
