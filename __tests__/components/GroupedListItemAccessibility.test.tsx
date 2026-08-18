import React from 'react';
import { TouchableOpacity } from 'react-native';
import renderer from 'react-test-renderer';

jest.mock('react-native-gesture-handler', () => {
  const ReactLocal = require('react');
  const { TouchableOpacity } = require('react-native');

  return {
    TouchableOpacity: (props) => ReactLocal.createElement(TouchableOpacity, props, props.children)
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    gray20: '#f4f4f4'
  },
  normalize: (value: number) => value
}));

jest.mock('../../src/helpers', () => ({
  momentFormat: (value: string, format: string) => {
    if (format === 'dd') return 'Mo';
    if (format === 'DD') return '01';
    return value;
  },
  removeHtml: (value: string) => value
}));

jest.mock('../../src/types', () => ({
  ScreenName: {
    Detail: 'Detail'
  }
}));

jest.mock('../../src/components/Text', () => ({
  BoldText: ({ children }) => children,
  HeadlineText: ({ children }) => children,
  RegularText: ({ children }) => children
}));

jest.mock('../../src/components/Wrapper', () => ({
  Wrapper: ({ children }) => children,
  WrapperHorizontal: ({ children }) => children,
  WrapperRow: ({ children }) => children
}));

import { GroupedListItem } from '../../src/components/GroupedListItem';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('GroupedListItem accessibility', () => {
  it('includes topTitle in the accessible name before the title with the title in parentheses', () => {
    const tree = renderWithAct(
      <GroupedListItem
        item={[
          {
            id: '1',
            params: {},
            publishedAt: '2025-09-01',
            title: 'Stadtratssitzungen vom 28. August und 1. September',
            topTitle: '01.09.2025 | LANDESHAUPTSTADT MAGDEBURG'
          }
        ]}
        navigation={{ navigate: jest.fn() }}
        options={{ groupKey: 'publishedAt' }}
      />
    );

    const button = tree.root.findByType(TouchableOpacity);

    expect(button.props.accessibilityLabel).toBe(
      '01.09.2025 | LANDESHAUPTSTADT MAGDEBURG (Stadtratssitzungen vom 28. August und 1. September)'
    );
  });
});
