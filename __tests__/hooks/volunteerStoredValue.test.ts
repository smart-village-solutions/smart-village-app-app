import { act, renderHook } from '@testing-library/react-native';

import { useVolunteerStoredValue } from '../../src/hooks/volunteer/storedValue';

const flush = async () => {
  await act(async () => {});
};

it('settles failed reads, allows retry and retains the last successful credentials', async () => {
  const load = jest.fn().mockRejectedValueOnce(new Error('locked'));
  const { result } = renderHook(() => useVolunteerStoredValue(load));
  await flush();
  expect(result.current).toMatchObject({ loading: false, error: true, value: undefined });
  const stored = { currentUserId: '7' };
  load.mockResolvedValueOnce(stored);
  act(() => result.current.retry());
  await flush();
  expect(result.current).toMatchObject({ loading: false, error: false, value: stored });
  load.mockRejectedValueOnce(new Error('temporarily locked again'));
  act(() => result.current.retry());
  await flush();
  expect(result.current).toMatchObject({ loading: false, error: true, value: stored });
});

it('ignores a superseded read that finishes after a retry', async () => {
  let finishOld: (value: string) => void = () => {};
  const load = jest
    .fn()
    .mockImplementationOnce(() => new Promise<string>((resolve) => (finishOld = resolve)))
    .mockResolvedValueOnce('current');
  const { result } = renderHook(() => useVolunteerStoredValue(load));
  await flush();
  act(() => result.current.retry());
  await flush();
  expect(result.current.value).toBe('current');
  await act(async () => finishOld('stale'));
  expect(result.current.value).toBe('current');
});
