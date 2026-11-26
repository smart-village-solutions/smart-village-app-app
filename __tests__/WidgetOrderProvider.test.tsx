import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Button, Text } from 'react-native';

import { WidgetOrderProvider } from '../src/WidgetOrderProvider';
import { addToStore, readFromStore } from '../src/helpers/storageHelper';
import { useWidgetOrder } from '../src/hooks/useWidgetOrder';

jest.mock('../src/helpers/storageHelper', () => ({
  addToStore: jest.fn(),
  readFromStore: jest.fn()
}));

const Home = () => {
  const { order, save } = useWidgetOrder(true);
  return (
    <>
      <Text>{order.length ? order.join(',') : 'configured order'}</Text>
      <Button title="Save order" onPress={() => void save(['weather', 'event'])} />
    </>
  );
};

beforeEach(() => jest.resetAllMocks());

test('waits for saved preferences before mounting Home and retains new saves across remounts', async () => {
  let restore!: (order: string[]) => void;
  (readFromStore as jest.Mock).mockReturnValue(
    new Promise<string[]>((resolve) => {
      restore = resolve;
    })
  );
  (addToStore as jest.Mock).mockResolvedValue(undefined);
  const tree = render(
    <WidgetOrderProvider>
      <Home />
    </WidgetOrderProvider>
  );

  expect(tree.toJSON()).toBeNull();
  await act(async () => restore(['event', 'weather']));
  expect(tree.getByText('event,weather')).toBeTruthy();
  expect(tree.queryByText('configured order')).toBeNull();

  fireEvent.press(tree.getByText('Save order'));
  await waitFor(() => expect(tree.getByText('weather,event')).toBeTruthy());
  tree.rerender(<WidgetOrderProvider>{null}</WidgetOrderProvider>);
  tree.rerender(
    <WidgetOrderProvider>
      <Home />
    </WidgetOrderProvider>
  );
  expect(tree.getByText('weather,event')).toBeTruthy();
  expect(readFromStore).toHaveBeenCalledTimes(1);
});

test.each([null, 'invalid', { event: 1 }])(
  'opens Home with the configured order when the stored preference is %p',
  async (stored) => {
    (readFromStore as jest.Mock).mockResolvedValue(stored);
    const tree = render(
      <WidgetOrderProvider>
        <Home />
      </WidgetOrderProvider>
    );
    await waitFor(() => expect(tree.getByText('configured order')).toBeTruthy());
    expect(addToStore).not.toHaveBeenCalled();
  }
);

test('storage failure does not block startup or overwrite the saved preference', async () => {
  (readFromStore as jest.Mock).mockRejectedValue(new Error('disk'));
  const tree = render(
    <WidgetOrderProvider>
      <Home />
    </WidgetOrderProvider>
  );
  await waitFor(() => expect(tree.getByText('configured order')).toBeTruthy());
  expect(addToStore).not.toHaveBeenCalled();
});
