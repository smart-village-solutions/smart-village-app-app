import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('../../src/config', () => ({
  colors: {
    gray20: '#eaeaea',
    gray40: '#dbdbe6',
    lightestText: '#ffffff',
    overlayRgba: 'rgba(20,20,20,0.7)',
    primary: '#107821',
    shadow: '#bcbcc1'
  },
  consts: {
    FILTER_TYPES: {
      CHECKBOX: 'checkbox',
      DATE: 'date',
      DROPDOWN: 'dropdown',
      SLIDER: 'slider',
      SUE: {
        STATUS: 'sue-status'
      },
      TEXT: 'text'
    }
  },
  device: {
    isTablet: false,
    platform: 'ios',
    width: 400
  },
  normalize: (value: number) => value
}));

jest.mock('../../src/AccessibilityProvider', () => {
  const ReactLocal = require('react');

  return {
    AccessibilityContext: ReactLocal.createContext({
      isReduceTransparencyEnabled: false
    })
  };
});

jest.mock('../../src/helpers', () => ({
  updateFilters: ({ currentFilters }: { currentFilters: Record<string, unknown> }) => currentFilters
}));

jest.mock('react-native-collapsible', () => ({ children }) => children);

jest.mock('../../src/components/Label', () => ({
  Label: ({ children }) => children
}));

jest.mock('../../src/components/Text', () => ({
  RegularText: ({ children, ...props }) => {
    const ReactLocal = require('react');
    return ReactLocal.createElement('mock-regular-text', props, children);
  }
}));

jest.mock('../../src/components/Wrapper', () => ({
  WrapperVertical: ({ children }) => children
}));

jest.mock('../../src/components/form', () => ({
  Input: () => null
}));

jest.mock('../../src/components/filter/DateFilter', () => ({
  DateFilter: () => null
}));

jest.mock('../../src/components/filter/DropdownFilter', () => ({
  DropdownFilter: () => null
}));

jest.mock('../../src/components/filter/SliderFilter', () => ({
  SliderFilter: () => null
}));

jest.mock('../../src/components/filter/Sue', () => ({
  StatusFilter: () => null
}));

import { FilterComponent } from '../../src/components/filter/FilterComponent';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('FilterComponent accessibility', () => {
  it('passes the visible checkbox label to the switch element', () => {
    const tree = renderWithAct(
      <FilterComponent
        filters={{}}
        filterTypes={[
          {
            type: 'checkbox',
            name: 'saveable',
            label: 'Filtereinstellungen',
            placeholder: 'Filtereinstellungen dauerhaft speichern',
            data: []
          }
        ]}
        setFilters={jest.fn()}
      />
    );

    const switchNode = tree.root.findByProps({ accessibilityRole: 'switch' });
    const labelNode = tree.root.findByType('mock-regular-text');

    expect(switchNode.props.accessibilityLabel).toBe(
      'Filtereinstellungen dauerhaft speichern'
    );
    expect(labelNode.props.accessible).toBe(false);
    expect(labelNode.props.importantForAccessibility).toBe('no');
  });

  it('passes the visible slider toggle label to the switch element', () => {
    const tree = renderWithAct(
      <FilterComponent
        filters={{ radiusSearch: { currentPosition: false } }}
        filterTypes={[
          {
            type: 'slider',
            name: 'radiusSearch',
            label: 'Entfernung (km)',
            data: [5, 10],
            currentPosition: {
              label: 'Umkreis',
              placeholder: 'Aktuelle Position nutzen'
            }
          }
        ]}
        setFilters={jest.fn()}
      />
    );

    const switches = tree.root.findAllByProps({ accessibilityRole: 'switch' });
    const labelNodes = tree.root.findAllByType('mock-regular-text');

    expect(switches[0].props.accessibilityLabel).toBe('Aktuelle Position nutzen');
    expect(labelNodes[0].props.accessible).toBe(false);
    expect(labelNodes[0].props.importantForAccessibility).toBe('no');
  });
});
