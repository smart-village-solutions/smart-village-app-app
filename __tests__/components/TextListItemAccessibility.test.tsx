import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');

  const ListItem = (props) => ReactLocal.createElement('mock-list-item', props, props.children);
  ListItem.Content = (props) => ReactLocal.createElement('mock-list-item-content', props, props.children);

  return { ListItem };
});

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  return {
    colors: {
      darkText: '#141414',
      transparent: 'transparent'
    },
    consts: {
      a11yLabel: {
        button: '(Taste)'
      }
    },
    Icon: {
      ArrowRight: () => ReactLocal.createElement('mock-arrow-right')
    },
    normalize: (value: number) => value
  };
});

jest.mock('../../src/helpers', () => ({
  isOpen: () => ({ open: false }),
  navigateToRoute: jest.fn(),
  trimNewLines: (value: string) => value
}));

jest.mock('../../src/components/Image', () => ({
  Image: () => null
}));

jest.mock('../../src/components/Text', () => ({
  BoldText: ({ children }) => children,
  HeadlineText: ({ children }) => children,
  RegularText: ({ children }) => children
}));

jest.mock('../../src/components/Touchable', () => ({
  Touchable: 'mock-touchable'
}));

jest.mock('../../src/components/Wrapper', () => ({
  WrapperRow: ({ children }) => children
}));

import { TextListItem } from '../../src/components/TextListItem';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('TextListItem accessibility', () => {
  it('includes overtitle before the title and wraps the title in parentheses', () => {
    const tree = renderWithAct(
      <TextListItem
        item={{
          id: '1',
          overtitle: '15.06.2026 | STAGING LHMD MAGDEBURG',
          params: {},
          routeName: 'Detail',
          title: 'Hackathon: Smart City Magdeburg am 5. Juni'
        }}
        navigation={{ navigate: jest.fn() } as never}
      />
    );

    const listItem = tree.root.findByType('mock-list-item');

    expect(listItem.props.accessibilityLabel).toBe(
      '15.06.2026 | STAGING LHMD MAGDEBURG (Hackathon: Smart City Magdeburg am 5. Juni) (Taste)'
    );
  });
});
