import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { LifeSituationListItem } from '../../src/components/BUS/LifeSituationListItem';

jest.mock('../../src/config', () => ({
  colors: {
    darkText: '#222222',
    transparent: 'transparent'
  },
  consts: {
    a11yLabel: {
      button: '(button)'
    }
  },
  Icon: {
    ArrowRight: () => null
  },
  normalize: (value: number) => value
}));

jest.mock('../../src/components/Image', () => ({
  Image: () => null
}));

jest.mock('../../src/helpers', () => ({
  spaceNewLines: (value?: string) => (value ? value.replace(/(\r\n|\n|\r)/gm, ' ') : value),
  trimNewLines: (value?: string) => (value ? value.replace(/(\r\n|\n|\r)/gm, '') : value)
}));

jest.mock('../../src/components/Text', () => {
  const { Text: MockText } = jest.requireActual('react-native');

  return {
    HeadlineText: ({ children }: { children?: React.ReactNode }) => <MockText>{children}</MockText>,
    RegularText: ({ children }: { children?: React.ReactNode }) => <MockText>{children}</MockText>
  };
});

jest.mock('../../src/components/Touchable', () => {
  const { View: MockView } = jest.requireActual('react-native');

  return {
    Touchable: ({ children, ...props }: { children?: React.ReactNode }) => (
      <MockView {...props}>{children}</MockView>
    )
  };
});

jest.mock('react-native-elements', () => {
  const { View: MockView } = jest.requireActual('react-native');

  const MockListItem = ({ children, ...props }: { children?: React.ReactNode }) => (
    <MockView {...props}>{children}</MockView>
  );

  MockListItem.Content = ({ children }: { children?: React.ReactNode }) => (
    <MockView>{children}</MockView>
  );

  return {
    ListItem: MockListItem
  };
});

describe('LifeSituationListItem', () => {
  it('renders HTML descriptions as readable text without joining paragraphs', () => {
    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <LifeSituationListItem
          onPress={jest.fn()}
          title="Geburt"
          subtitle={'<p>Eltern &amp; <strong>Kinder</strong></p><p>Weitere<br/>Informationen</p>'}
        />
      );
    });

    expect(component!.root.findAllByType(Text).map((node) => node.props.children)).toEqual([
      'Geburt',
      'Eltern & Kinder Weitere Informationen'
    ]);
  });

  it('uses the sanitized title for the rendered label and accessibility label', () => {
    let component: renderer.ReactTestRenderer;

    act(() => {
      component = renderer.create(
        <LifeSituationListItem onPress={jest.fn()} title={'Titel\nmit Umbruch'} />
      );
    });

    const item = component!.root.findByProps({
      accessibilityLabel: '(Titelmit Umbruch) (button)'
    });

    expect(item).toBeTruthy();
    expect(component!.root.findByType(Text).props.children).toBe('Titelmit Umbruch');
  });
});
