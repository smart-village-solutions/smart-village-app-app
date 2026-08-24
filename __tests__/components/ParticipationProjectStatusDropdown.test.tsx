/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React, { useState } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { FilterComponent } from '../../src/components/filter/FilterComponent';
import { FilterProps } from '../../src/types';

jest.mock('../../src/helpers', () => ({
  updateFilters: ({ currentFilters, name, removeFromFilter, value }) => {
    const updatedFilters = { ...currentFilters };

    if (removeFromFilter) {
      delete updatedFilters[name];
    } else {
      updatedFilters[name] = value;
    }

    return updatedFilters;
  }
}));

jest.mock('../../src/components/filter/DateFilter', () => ({ DateFilter: () => null }));
jest.mock('../../src/components/filter/SliderFilter', () => ({ SliderFilter: () => null }));
jest.mock('../../src/components/filter/Sue', () => ({ StatusFilter: () => null }));

jest.mock('../../src/components/DropdownSelect', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    DropdownSelect: ({ data, setData }) => {
      const [isOpen, setIsOpen] = React.useState(false);

      return (
        <View>
          <Text testID="dropdown-open">{isOpen ? 'open' : 'closed'}</Text>
          <Text testID="dropdown-state">
            {data.map((item) => `${item.id}:${item.selected}`).join('|')}
          </Text>
          <Text onPress={() => setIsOpen(true)}>Open dropdown</Text>
          {isOpen && (
            <Text
              onPress={() =>
                setData(
                  data.map((item) => ({
                    ...item,
                    selected: item.id === 3 ? true : item.id === 0 ? false : item.selected
                  }))
                )
              }
            >
              Select completed
            </Text>
          )}
        </View>
      );
    }
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    borderRgba: '#000000',
    darkText: '#000000'
  },
  consts: {
    FILTER_TYPES: {
      CHECKBOX: 'checkbox',
      DATE: 'date',
      DROPDOWN: 'dropdown',
      SUE: { STATUS: 'sue-status' },
      SLIDER: 'slider',
      TEXT: 'text'
    }
  },
  device: { width: 390 },
  normalize: (value: number) => value
}));

const statusOptions = [
  {
    filterValue: 'active',
    id: 1,
    index: 0,
    selected: true,
    value: 'Aktiv (1)'
  },
  {
    filterValue: 'announced',
    id: 2,
    index: 1,
    selected: false,
    value: 'Ankündigung (1)'
  },
  {
    filterValue: 'completed',
    id: 3,
    index: 2,
    selected: false,
    value: 'Abgeschlossen (1)'
  }
];

const StatusDropdownHarness = () => {
  const [filters, setFilters] = useState<FilterProps>({
    participationStatus: ['active']
  });

  return (
    <>
      <Text testID="selected-statuses">{JSON.stringify(filters.participationStatus)}</Text>
      <FilterComponent
        filterTypes={[
          {
            data: statusOptions,
            isMultiselect: true,
            name: 'participationStatus',
            placeholder: 'Status auswählen',
            type: 'dropdown'
          } as never
        ]}
        filters={filters}
        setFilters={setFilters}
      />
    </>
  );
};

describe('ParticipationProject status dropdown', () => {
  it('keeps active selected when completed is added', async () => {
    const screen = render(<StatusDropdownHarness />);

    expect(screen.getByTestId('dropdown-state').props.children).toContain('0:false');

    fireEvent.press(screen.getByText('Open dropdown'));
    fireEvent.press(screen.getByText('Select completed'));

    await waitFor(() =>
      expect(screen.getByTestId('selected-statuses').props.children).toBe('["active","completed"]')
    );
    expect(screen.getByTestId('dropdown-open').props.children).toBe('open');
  });
});
