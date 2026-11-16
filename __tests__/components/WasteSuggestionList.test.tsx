import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { WasteSuggestionList } from '../../src/components/waste/WasteSuggestionList';

jest.mock('../../src/config', () => ({
  texts: { accessibilityLabels: { actions: { loadMore: 'Mehr laden' } } }
}));
jest.mock('../../src/components/Button', () => ({
  Button: ({ onPress, title }: { onPress: () => void; title: string }) => {
    const { Pressable, Text: NativeText } = jest.requireActual('react-native');
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <NativeText>{title}</NativeText>
      </Pressable>
    );
  }
}));

it('renders suggestions in bounded batches and resets the batch for a new query', () => {
  const data = Array.from({ length: 120 }, (_, index) => `Street ${index}`);
  const renderItem = jest.fn(({ item }: { item: string }) => <Text>{item}</Text>);
  const tree = render(<WasteSuggestionList data={data} renderItem={renderItem} />);

  expect(renderItem).toHaveBeenCalledTimes(50);
  expect(tree.queryByText('Street 50')).toBeNull();
  fireEvent.press(tree.getByRole('button'));
  expect(tree.getByText('Street 99')).toBeTruthy();
  expect(tree.queryByText('Street 100')).toBeNull();
  fireEvent.press(tree.getByRole('button'));
  expect(tree.getByText('Street 119')).toBeTruthy();
  expect(tree.queryByRole('button')).toBeNull();

  tree.rerender(<WasteSuggestionList data={[...data]} renderItem={renderItem} />);
  expect(tree.queryByText('Street 50')).toBeNull();
  expect(tree.getByRole('button')).toBeTruthy();
});

it('handles missing results without rendering a load-more action', () => {
  const renderItem = jest.fn();
  const tree = render(<WasteSuggestionList data={null} renderItem={renderItem} />);

  expect(renderItem).not.toHaveBeenCalled();
  expect(tree.queryByRole('button')).toBeNull();
});
