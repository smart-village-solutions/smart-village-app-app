import React from 'react';
import { AppState } from 'react-native';
import renderer from 'react-test-renderer';

import { NetworkContext } from '../../src/NetworkProvider';
import { SueReportRuntime } from '../../src/SueReportRuntime';
import { syncSueOutbox } from '../../src/helpers/sueReportSync';

const mockInvalidate = jest.fn();
jest.mock('react-query', () => ({ useQueryClient: () => ({ invalidateQueries: mockInvalidate }) }));
jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: jest.requireActual('react').createContext({ isConnected: false })
}));
jest.mock('../../src/helpers/sueReportSync', () => ({
  syncSueOutbox: jest.fn().mockResolvedValue(undefined)
}));
jest.mock('../../src/helpers/sueReportStorage', () => ({
  subscribeSueOutbox: jest.fn(() => jest.fn())
}));

it('checks on startup, reconnection, foreground and timer, and stops the timer on unmount', async () => {
  jest.useFakeTimers();
  const remove = jest.fn();
  let changeState: (state: string) => void = () => undefined;
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
    changeState = handler;
    return { remove };
  });
  let tree: renderer.ReactTestRenderer;
  const render = (isConnected: boolean) => (
    <NetworkContext.Provider value={{ isConnected, isMainserverUp: null }}>
      <SueReportRuntime />
    </NetworkContext.Provider>
  );
  try {
    await renderer.act(async () => {
      tree = renderer.create(render(false));
    });
    expect(syncSueOutbox).toHaveBeenCalledTimes(1);
    await renderer.act(async () => {
      tree!.update(render(true));
    });
    expect(syncSueOutbox).toHaveBeenCalledTimes(2);
    await renderer.act(async () => {
      changeState('active');
    });
    expect(syncSueOutbox).toHaveBeenCalledTimes(3);
    await renderer.act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    expect(syncSueOutbox).toHaveBeenCalledTimes(4);
    await renderer.act(async () => {
      tree!.unmount();
    });
    await renderer.act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(syncSueOutbox).toHaveBeenCalledTimes(4);
    expect(remove).toHaveBeenCalledTimes(2);
  } finally {
    jest.useRealTimers();
    jest.restoreAllMocks();
  }
});
