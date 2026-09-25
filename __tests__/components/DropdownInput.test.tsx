/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';

import { DropdownInput } from '../../src/components/form/DropdownInput';

const mockOnChange = jest.fn();

jest.mock('../../src/components/DropdownSelect', () => {
  const React = require('react');
  const { Button } = require('react-native');

  return {
    DropdownSelect: ({ data, onSearchBlur, setData }) => (
      <Button
        title="Select category"
        onPress={() => {
          setData(data.map((entry) => ({ ...entry, selected: entry.name === 'Straßen' })));
          onSearchBlur?.();
        }}
      />
    )
  };
});

jest.mock('../../src/components/form/Input', () => ({ Input: () => null }));
jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: () => ({ labelWrapper: {}, searchInput: {} })
}));
jest.mock('../../src/config', () => ({ texts: { volunteer: { search: 'Suche' } } }));

const CategoryForm = () => {
  const { control } = useForm({ defaultValues: { categoryName: '' } });
  const [, setFocused] = React.useState(true);

  return (
    <Controller
      control={control}
      name="categoryName"
      render={({ field }) => (
        <>
          <DropdownInput
            control={control}
            data={[{ id: 12, name: 'Straßen', value: 'Straßen' }]}
            errors={{}}
            inlineSearch
            label="Kategorie"
            name={field.name}
            onChange={(selectedValue) => {
              mockOnChange(selectedValue);
              field.onChange(selectedValue);
            }}
            onSearchBlur={() => setFocused(false)}
            placeholder="Kategorie"
            required
            value={field.value}
            valueKey="name"
          />
          <Text testID="selected-category">{field.value}</Text>
        </>
      )}
    />
  );
};

const MultipleCategoryForm = () => {
  const { control } = useForm({ defaultValues: { categoryIds: [] as number[] } });

  return (
    <Controller
      control={control}
      name="categoryIds"
      render={({ field }) => (
        <>
          <DropdownInput
            control={control}
            data={[{ id: 12, name: 'Straßen', value: 'Straßen' }]}
            errors={{}}
            label="Kategorien"
            multipleSelect
            name={field.name}
            onChange={(selectedValue) => {
              mockOnChange(selectedValue);
              field.onChange(selectedValue);
            }}
            placeholder="Kategorien"
            value={field.value}
            valueKey="id"
          />
          <Text testID="selected-categories">{JSON.stringify(field.value)}</Text>
        </>
      )}
    />
  );
};

describe('DropdownInput', () => {
  beforeEach(() => mockOnChange.mockClear());

  it('updates the form once when selecting a category while the parent rerenders', async () => {
    const screen = render(<CategoryForm />);

    fireEvent.press(screen.getByText('Select category'));

    await waitFor(() =>
      expect(screen.getByTestId('selected-category').props.children).toBe('Straßen')
    );
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('keeps multi-select values as ids', async () => {
    const screen = render(<MultipleCategoryForm />);

    fireEvent.press(screen.getByText('Select category'));

    await waitFor(() =>
      expect(screen.getByTestId('selected-categories').props.children).toBe('[12]')
    );
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith([12]);
  });
});
