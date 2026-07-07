import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import renderer from 'react-test-renderer';

jest.mock('react-native-collapsible', () => ({ children }) => children);

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');
  const { View } = require('react-native');

  return {
    Divider: () => null,
    Header: ({ rightComponent }) => (
      <View testID="filter-header">
        {ReactLocal.isValidElement(rightComponent) ? rightComponent : <View testID="header-icon" />}
      </View>
    )
  };
});

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  const MockIcon = () => ReactLocal.createElement('mock-icon');

  return {
    colors: {
      darkText: '#141414',
      primary: '#107821',
      transparent: 'transparent'
    },
    consts: {
      a11yLabel: {
        button: '(Taste)'
      }
    },
    Icon: {
      Close: MockIcon,
      Filter: MockIcon
    },
    normalize: (value: number) => value,
    texts: {
      accessibilityLabels: {
        actions: {
          close: 'Schließen'
        }
      },
      filter: {
        filter: 'Filtern',
        header: 'Filter',
        hideFilter: 'Filter ausblenden',
        resetFilter: 'Zurücksetzen',
        showFilter: 'Filter anzeigen'
      }
    }
  };
});

jest.mock('../../src/helpers', () => ({
  momentFormat: (value: string) => value
}));

jest.mock('../../src/components/Button', () => ({
  Button: ({ title }) => title
}));

jest.mock('../../src/components/Text', () => ({
  BoldText: ({ children }) => children,
  RegularText: ({ children }) => children
}));

jest.mock('../../src/components/Wrapper', () => ({
  Wrapper: ({ children }) => children,
  WrapperRow: ({ children }) => children,
  WrapperVertical: ({ children }) => children
}));

jest.mock('../../src/components/filter/FilterComponent', () => ({
  FilterComponent: () => null
}));

import { Filter } from '../../src/components/filter/Filter';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('Filter accessibility', () => {
  it('renders the overlay close control as an accessible button with the same dismiss behavior', () => {
    const tree = renderWithAct(
      <Filter
        filterTypes={[{ name: 'saveable', type: 'CHECKBOX' } as never]}
        initialQueryVariables={{}}
        isOverlay
        queryVariables={{}}
        setQueryVariables={jest.fn()}
      />
    );

    const toggleButton = tree.root.findAllByType(TouchableOpacity)[0];

    renderer.act(() => {
      toggleButton.props.onPress();
    });

    const closeButton = tree.root.findAllByType(TouchableOpacity).find(
      (button) => button.props.accessibilityLabel === 'Schließen (Taste)'
    );

    expect(closeButton).toBeDefined();
    expect(closeButton?.props.accessibilityRole).toBe('button');

    renderer.act(() => {
      closeButton?.props.onPress();
    });

    expect(
      tree.root.findAllByType(TouchableOpacity).some(
        (button) => button.props.accessibilityLabel === 'Schließen (Taste)'
      )
    ).toBe(false);
  });
});
