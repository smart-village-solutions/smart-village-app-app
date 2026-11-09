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
      <Text testID={error ? 'over-limit' : undefined}>{children}</Text>
    )
  };
});
jest.mock('../../src/components/form', () => {
  const { Text, TextInput } = jest.requireActual<typeof import('react-native')>('react-native');
  const { useController } = jest.requireActual<typeof import('react-hook-form')>('react-hook-form');

  return {
    Input: ({
      control,
      errorMessage,
      maxLength,
      name
    }: {
      control: Control;
      errorMessage?: string;
      maxLength?: number;
      name: string;
    }) => {
      const { field } = useController({ control, name });
      return (
        <>
          <TextInput
            testID={name}
            value={field.value}
            onChangeText={field.onChange}
            maxLength={maxLength}
          />
          {errorMessage && <Text>{errorMessage}</Text>}
        </>
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
  const { getByTestId, getByText, queryByText, queryByTestId } = render(<Form />);
  const message = 'Erlaubte Zeichenzahl überschritten.';

  expect(getByTestId(field).props.maxLength).toBeUndefined();

  fireEvent.changeText(getByTestId(field), 'a'.repeat(limit + 3));

  expect(getByTestId('over-limit').props.children).toBe(`ⓘ ${limit + 3} von ${limit} Zeichen`);
  expect(getByText(message)).toBeTruthy();

  fireEvent.changeText(getByTestId(field), 'a'.repeat(limit));

  expect(getByText(`ⓘ ${limit} von ${limit} Zeichen`)).toBeTruthy();
  expect(queryByTestId('over-limit')).toBeNull();
  expect(queryByText(message)).toBeNull();
});
