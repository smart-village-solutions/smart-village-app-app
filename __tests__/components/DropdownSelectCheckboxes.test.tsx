/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { render } from '@testing-library/react-native';

import { DropdownSelect } from '../../src/components/DropdownSelect';

jest.mock('react-native-modal-dropdown', () => {
  const React = require('react');
  const { View } = require('react-native');

  return React.forwardRef(({ children, options, renderRow }, ref) => {
    React.useImperativeHandle(ref, () => ({ select: jest.fn() }));

    return (
      <View>
        {children}
        {options.map((option, index) => (
          <View key={option}>{renderRow(option, index, false)}</View>
        ))}
      </View>
    );
  });
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ left: 0 })
}));

jest.mock('../../src/OrientationProvider', () => {
  const React = require('react');

  return { OrientationContext: React.createContext({ orientation: 'portrait' }) };
});

jest.mock('../../src/components/Label', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return { Label: ({ children }) => <Text>{children}</Text> };
});

jest.mock('../../src/components/Text', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return { RegularText: ({ children, ...props }) => <Text {...props}>{children}</Text> };
});

jest.mock('../../src/components/Wrapper', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockWrapper = ({ children, ...props }) => <View {...props}>{children}</View>;

  return {
    Wrapper: MockWrapper,
    WrapperHorizontal: MockWrapper,
    WrapperRow: MockWrapper
  };
});

jest.mock('../../src/config', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    colors: {
      borderRgba: '#cccccc',
      darkText: '#111111',
      gray40: '#dddddd',
      lightestText: '#ffffff',
      primary: '#008000',
      shadow: '#999999'
    },
    consts: {
      a11yLabel: {
        dropDownMenu: 'Auswahlmenü',
        dropDownMenuItem: 'Auswahlmenüeintrag'
      }
    },
    device: {
      height: 844,
      platform: 'ios',
      width: 390
    },
    Icon: {
      ArrowDown: () => null,
      ArrowUp: () => null,
      Square: () => <Text testID="checkbox-unchecked">unchecked</Text>,
      SquareCheckFilled: () => <Text testID="checkbox-checked">checked</Text>
    },
    normalize: (value: number) => value,
    texts: {
      accessibilityLabels: {
        checkbox: {
          active: 'ausgewählt',
          inactive: 'nicht ausgewählt'
        },
        dropDownMenu: {
          closed: 'geschlossen'
        }
      }
    }
  };
});

describe('DropdownSelect multiselect checkboxes', () => {
  it('shows an accessible checkbox for every status option', () => {
    const screen = render(
      <DropdownSelect
        data={[
          { id: 0, index: 0, selected: false, value: 'Status auswählen' },
          { id: 1, index: 0, selected: true, value: 'Aktiv (4)' },
          { id: 2, index: 1, selected: false, value: 'Ankündigung (2)' }
        ]}
        label="Status"
        multipleSelect
        placeholder="Status auswählen"
        setData={jest.fn()}
      />
    );

    expect(screen.getByLabelText(/Aktiv \(4\).*ausgewählt/)).toBeTruthy();
    expect(screen.getByLabelText(/Ankündigung \(2\).*nicht ausgewählt/)).toBeTruthy();
    expect(screen.getAllByTestId('checkbox-checked')).toHaveLength(1);
    expect(screen.getAllByTestId('checkbox-unchecked')).toHaveLength(1);
  });
});
