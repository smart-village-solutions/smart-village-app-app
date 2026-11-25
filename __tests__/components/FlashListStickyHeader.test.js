import { FlashList } from '@shopify/flash-list';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

jest.mock('@shopify/flash-list/dist/recyclerview/utils/measureLayout', () => ({
  ...jest.requireActual('@shopify/flash-list/dist/recyclerview/utils/measureLayout'),
  measureParentSize: () => ({ x: 0, y: 60, width: 400, height: 500 }),
  measureFirstChildLayout: () => ({ x: 0, y: 0, width: 400, height: 0 }),
  measureItemLayout: () => ({ x: 0, y: 0, width: 400, height: 100 })
}));

it('pins a date only when its row reaches the top of a list below other content', () => {
  const screen = render(
    <FlashList
      testID="event-list"
      data={['10.11.', 'Event A', '11.11.', 'Event B', 'Event C', 'Event D', 'Event E']}
      stickyHeaderIndices={[0, 2]}
      renderItem={({ item, target }) => (
        <Text testID={target === 'StickyHeader' ? 'pinned-date' : undefined}>{item}</Text>
      )}
    />,
    { createNodeMock: () => ({}) }
  );

  const scrollTo = (y) =>
    fireEvent.scroll(screen.getByTestId('event-list'), {
      nativeEvent: {
        contentOffset: { x: 0, y },
        contentSize: { width: 400, height: 700 },
        layoutMeasurement: { width: 400, height: 500 }
      }
    });

  scrollTo(150);
  expect(screen.getByTestId('pinned-date')).toHaveTextContent('10.11.');
  expect(screen.getAllByText('11.11.')).toHaveLength(1);

  scrollTo(200);
  expect(screen.getByTestId('pinned-date')).toHaveTextContent('11.11.');

  scrollTo(150);
  expect(screen.getByTestId('pinned-date')).toHaveTextContent('10.11.');
  expect(screen.getAllByText('11.11.')).toHaveLength(1);
});
