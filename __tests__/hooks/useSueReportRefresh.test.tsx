import { act, renderHook } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';

import { useSueReportRefresh } from '../../src/hooks/useSueReportRefresh';

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual('react');
    React.useEffect(callback, [callback]);
  }
}));

describe('personal report refresh lifecycle', () => {
  let listener: (state: AppStateStatus) => void;
  const remove = jest.fn();
  const originalAppState = AppState.currentState;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    AppState.currentState = 'active';
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, callback) => {
      listener = callback;
      return { remove };
    });
  });

  afterEach(() => {
    AppState.currentState = originalAppState;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const changeAppState = (state: AppStateStatus) => {
    AppState.currentState = state;
    listener(state);
  };

  it('refreshes on focus, polls while visible, and stops when leaving the screen', async () => {
    const refetch = jest.fn().mockResolvedValue(undefined);
    const { unmount } = renderHook(() => useSueReportRefresh(refetch, true));
    await act(async () => {});
    expect(refetch).toHaveBeenCalledTimes(1);

    await act(async () => jest.advanceTimersByTime(30_000));
    expect(refetch).toHaveBeenCalledTimes(2);

    unmount();
    await act(async () => jest.advanceTimersByTime(60_000));
    expect(refetch).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('pauses in the background and refreshes immediately on returning', async () => {
    const refetch = jest.fn().mockResolvedValue(undefined);
    const { unmount } = renderHook(() => useSueReportRefresh(refetch, true));
    await act(async () => changeAppState('background'));
    await act(async () => jest.advanceTimersByTime(60_000));
    expect(refetch).toHaveBeenCalledTimes(1);

    await act(async () => changeAppState('active'));
    expect(refetch).toHaveBeenCalledTimes(2);
    unmount();
  });

  it('does not refresh offline and resumes after reconnecting', async () => {
    const refetch = jest.fn().mockResolvedValue(undefined);
    const { rerender, unmount } = renderHook(
      ({ enabled }) => useSueReportRefresh(refetch, enabled),
      { initialProps: { enabled: false } }
    );
    await act(async () => jest.advanceTimersByTime(60_000));
    expect(refetch).not.toHaveBeenCalled();

    rerender({ enabled: true });
    await act(async () => {});
    expect(refetch).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('does not overlap slow refreshes', async () => {
    let finish: () => void = () => {};
    const refetch = jest.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { unmount } = renderHook(() => useSueReportRefresh(refetch, true));
    await act(async () => jest.advanceTimersByTime(90_000));
    expect(refetch).toHaveBeenCalledTimes(1);

    await act(async () => finish());
    await act(async () => jest.advanceTimersByTime(30_000));
    expect(refetch).toHaveBeenCalledTimes(2);
    await act(async () => finish());
    unmount();
  });
});
