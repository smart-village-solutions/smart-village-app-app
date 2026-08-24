/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { DropdownSelect } from '../../src/components/DropdownSelect';

jest.mock('react-native-modal-dropdown', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return React.forwardRef(({ children, onSelect, options, renderRow }, ref) => {
    const [visible, setVisible] = React.useState(true);
    React.useImperativeHandle(ref, () => ({ select: jest.fn() }));

    return (
      <View testID="modal-dropdown">
        {children}
        {visible &&
          options.map((option, index) => (
            <View key={option}>
              <Text
                testID={`select-${index}`}
                onPress={() => {
                  if (onSelect(index, option) !== false) setVisible(false);
                }}
              >
                {renderRow(option, index, false)}
              </Text>
            </View>
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
          closed: 'geschlossen',
          open: 'geöffnet'
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

  it('keeps the dropdown open when selecting multiple options', () => {
    const setData = jest.fn();

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
        setData={setData}
      />
    );

    fireEvent.press(screen.getByTestId('select-2'));

    expect(screen.getByTestId('select-2')).toBeTruthy();
    expect(setData).toHaveBeenCalledWith([
      expect.objectContaining({ selected: false, value: 'Status auswählen' }),
      expect.objectContaining({ selected: true, value: 'Aktiv (4)' }),
      expect.objectContaining({ selected: true, value: 'Ankündigung (2)' })
    ]);
  });

  it('keeps the last required option selected', () => {
    const setData = jest.fn();
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
        requireSelection
        setData={setData}
      />
    );

    fireEvent.press(screen.getByTestId('select-1'));

    expect(screen.getByTestId('select-1')).toBeTruthy();
    expect(setData).not.toHaveBeenCalled();
  });

  it('allows assistive technology to toggle an inline checkbox', () => {
    const setData = jest.fn();
    const screen = render(
      <DropdownSelect
        data={[
          { id: 0, index: 0, selected: false, value: 'Status auswählen' },
          { id: 1, index: 0, selected: true, value: 'Aktiv (4)' },
          { id: 2, index: 1, selected: false, value: 'Ankündigung (2)' }
        ]}
        inlineDropdown
        isOverlayFilter
        label="Status"
        multipleSelect
        placeholder="Status auswählen"
        setData={setData}
      />
    );

    fireEvent.press(screen.getByLabelText(/Status.*geschlossen/));

    const announcedCheckbox = screen.getByRole('checkbox', {
      name: /Ankündigung \(2\).*nicht ausgewählt/
    });
    expect(announcedCheckbox.props.accessibilityState).toEqual({ checked: false });

    fireEvent.press(announcedCheckbox);

    expect(setData).toHaveBeenCalledWith([
      expect.objectContaining({ selected: false, value: 'Status auswählen' }),
      expect.objectContaining({ selected: true, value: 'Aktiv (4)' }),
      expect.objectContaining({ selected: true, value: 'Ankündigung (2)' })
    ]);
  });
});
