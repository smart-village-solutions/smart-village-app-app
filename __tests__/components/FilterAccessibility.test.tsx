import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import renderer from 'react-test-renderer';

jest.mock(
  'react-native-collapsible',
  () =>
    ({ children }) =>
      children
);

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
  Button: ({ disabled, onPress, title }) => {
    const ReactLocal = require('react');
    const { Text, TouchableOpacity } = require('react-native');

    return (
      <TouchableOpacity
        accessibilityLabel={title}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
      >
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  }
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
  FilterComponent: ({ setFilters }) => {
    const ReactLocal = require('react');
    const { Text, TouchableOpacity, View } = require('react-native');
    const [isDropdownOpen, setIsDropdownOpen] = ReactLocal.useState(false);

    return (
      <View>
        <TouchableOpacity
          accessibilityLabel="Status-Dropdown öffnen"
          onPress={() => setIsDropdownOpen(true)}
        >
          <Text>Status</Text>
        </TouchableOpacity>
        {isDropdownOpen && (
          <TouchableOpacity
            accessibilityLabel="Abgeschlossen auswählen"
            onPress={() =>
              setFilters((filters) => ({
                ...filters,
                participationStatus: ['active', 'completed']
              }))
            }
          >
            <Text>Abgeschlossen</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}));

import { Filter } from '../../src/components/filter/Filter';
import { darkColors } from '../../src/config/colors';
import { ThemeContext } from '../../src/ThemeContext';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('Filter accessibility', () => {
  it('counts a configured initial filter as active', () => {
    const tree = renderWithAct(
      <Filter
        countInitialFilter="participationStatus"
        filterTypes={[{ name: 'participationStatus', type: 'DROPDOWN', data: [{}] } as never]}
        initialQueryVariables={{ participationStatus: ['active'] }}
        isOverlay
        queryVariables={{ participationStatus: ['active'] }}
        setQueryVariables={jest.fn()}
      />
    );

    expect(JSON.stringify(tree.toJSON())).toContain('"1"');
  });

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

    const closeButton = tree.root
      .findAllByType(TouchableOpacity)
      .find((button) => button.props.accessibilityLabel === 'Schließen (Taste)');

    expect(closeButton).toBeDefined();
    expect(closeButton?.props.accessibilityRole).toBe('button');

    renderer.act(() => {
      closeButton?.props.onPress();
    });

    expect(
      tree.root
        .findAllByType(TouchableOpacity)
        .some((button) => button.props.accessibilityLabel === 'Schließen (Taste)')
    ).toBe(false);
  });

  it('uses the active dark background for the complete overlay surface', () => {
    const tree = renderWithAct(
      <ThemeContext.Provider value={{ colors: darkColors, isDark: true, mode: 'dark' }}>
        <Filter
          filterTypes={[{ name: 'saveable', type: 'CHECKBOX' } as never]}
          initialQueryVariables={{}}
          isOverlay
          queryVariables={{}}
          setQueryVariables={jest.fn()}
        />
      </ThemeContext.Provider>
    );

    const toggleButton = tree.root.findAllByType(TouchableOpacity)[0];

    renderer.act(() => {
      toggleButton.props.onPress();
    });

    const overlaySurface = tree.root.find(
      (node) =>
        StyleSheet.flatten(node.props.style)?.backgroundColor === darkColors.background &&
        StyleSheet.flatten(node.props.style)?.flex === 1
    );

    expect(overlaySurface).toBeDefined();
  });

  it('applies participation statuses with one press while the dropdown is open', () => {
    const setQueryVariables = jest.fn();
    const tree = renderWithAct(
      <Filter
        countInitialFilter="participationStatus"
        filterTypes={[{ name: 'participationStatus', type: 'DROPDOWN', data: [{}] } as never]}
        initialQueryVariables={{ participationStatus: ['active'] }}
        isOverlay
        queryVariables={{ participationStatus: ['active'] }}
        setQueryVariables={setQueryVariables}
      />
    );

    const findTouchable = (accessibilityLabel: string) =>
      tree.root
        .findAllByType(TouchableOpacity)
        .find((touchable) => touchable.props.accessibilityLabel === accessibilityLabel);

    renderer.act(() => {
      tree.root.findAllByType(TouchableOpacity)[0].props.onPress();
    });
    renderer.act(() => {
      findTouchable('Status-Dropdown öffnen')?.props.onPress();
    });
    renderer.act(() => {
      findTouchable('Abgeschlossen auswählen')?.props.onPress();
    });

    expect(findTouchable('Abgeschlossen auswählen')).toBeDefined();

    renderer.act(() => {
      findTouchable('Filtern')?.props.onPress();
    });

    expect(setQueryVariables).toHaveBeenCalledWith({
      participationStatus: ['active', 'completed']
    });
    expect(findTouchable('Abgeschlossen auswählen')).toBeUndefined();
  });
});
