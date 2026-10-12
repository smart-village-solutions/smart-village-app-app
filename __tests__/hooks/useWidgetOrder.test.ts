import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useWidgetOrder } from '../../src/hooks/useWidgetOrder';
import { addToStore, readFromStore } from '../../src/helpers/storageHelper';

jest.mock('../../src/helpers/storageHelper', () => ({
  addToStore: jest.fn(),
  readFromStore: jest.fn()
}));

beforeEach(() => jest.resetAllMocks());

test('restores order, bypasses it while disabled and only updates after saving succeeds', async () => {
  (readFromStore as jest.Mock).mockResolvedValue(['event', 'weather']);
  (addToStore as jest.Mock).mockResolvedValue(undefined);
  const { result, rerender } = renderHook(({ enabled }) => useWidgetOrder(enabled), {
    initialProps: { enabled: true }
  });
  await waitFor(() => expect(result.current.loaded).toBe(true));
  expect(result.current.order).toEqual(['event', 'weather']);
  rerender({ enabled: false });
  expect(result.current.order).toEqual([]);
  rerender({ enabled: true });
  expect(result.current.order).toEqual(['event', 'weather']);
  await act(async () => {
    await result.current.save(['weather', 'event']);
  });
  expect(addToStore).toHaveBeenCalledWith('PERSONALIZED_WIDGET_ORDER', ['weather', 'event']);
  (addToStore as jest.Mock).mockRejectedValue(new Error('disk'));
  await act(async () => {
    await expect(result.current.save(['event'])).rejects.toThrow('disk');
  });
  expect(result.current.order).toEqual(['weather', 'event']);
});

test('a failed read does not overwrite stored preferences', async () => {
  (readFromStore as jest.Mock).mockRejectedValue(new Error('disk'));
  const { result } = renderHook(() => useWidgetOrder(true));
  await waitFor(() => expect(result.current.loaded).toBe(true));
  expect(addToStore).not.toHaveBeenCalled();
});
