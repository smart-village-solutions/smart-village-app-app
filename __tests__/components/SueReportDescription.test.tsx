import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { type Control, useForm } from 'react-hook-form';

import { SueReportDescription } from '../../src/components/SUE/report/SueReportDescription';
import type { TValues } from '../../src/screens';

jest.mock('../../src/components/selectors', () => ({ MultiImageSelector: () => null }));
jest.mock('../../src/components/Text', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    RegularText: ({ children, error }: { children: string; error: boolean }) => (
      <Text testID={error ? 'length-error' : undefined}>{children}</Text>
    )
  };
});
jest.mock('../../src/components/form', () => {
  const { TextInput } = jest.requireActual<typeof import('react-native')>('react-native');
  const { useController } = jest.requireActual<typeof import('react-hook-form')>('react-hook-form');

  return {
    Input: ({
      control,
      invalid,
      maxLength,
      name
    }: {
      control: Control;
      invalid?: boolean;
      maxLength?: number;
      name: string;
    }) => {
      const { field } = useController({ control, name });
      const accessibilityState = { disabled: false, invalid };
      return (
        <TextInput
          testID={name}
          value={field.value}
          onChangeText={field.onChange}
          maxLength={maxLength}
          accessibilityState={accessibilityState}
        />
      );
    }
  };
});

const Form = () => {
  const { control, setValue } = useForm<TValues>({
    defaultValues: { title: '', description: '', images: '[]' }
  });

  return (
    <SueReportDescription
      configuration={{
        limitation: {
          reportTitleMaxLength: { value: 100 },
          reportDescriptionMaxLength: { value: 700 }
        }
      }}
      control={control}
      errorMessage=""
      setSelectedPosition={jest.fn()}
      setShowCoordinatesFromImageAlert={jest.fn()}
      setUpdateRegionFromImage={jest.fn()}
      setValue={setValue}
      storeReportValues={jest.fn()}
    />
  );
};

it.each([
  ['title', 100],
  ['description', 700]
] as const)('shows and clears the length error for %s as the user edits', (field, limit) => {
  const { getAllByTestId, getByTestId, getByText, queryByText, queryByTestId } = render(<Form />);
  const message = 'Erlaubte Zeichenzahl überschritten.';

  expect(getByTestId(field).props.maxLength).toBeUndefined();

  fireEvent.changeText(getByTestId(field), 'a'.repeat(limit + 3));

  expect(getByTestId(field).props.accessibilityState.invalid).toBe(true);
  expect(getAllByTestId('length-error').map((node) => node.props.children)).toEqual([
    `ⓘ ${limit + 3} von ${limit} Zeichen`,
    message
  ]);

  fireEvent.changeText(getByTestId(field), 'a'.repeat(limit));

  expect(getByTestId(field).props.accessibilityState.invalid).toBe(false);
  expect(getByText(`ⓘ ${limit} von ${limit} Zeichen`)).toBeTruthy();
  expect(queryByTestId('length-error')).toBeNull();
  expect(queryByText(message)).toBeNull();
});
