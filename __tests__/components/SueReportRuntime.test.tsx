import React from 'react';
import { AppState } from 'react-native';
import renderer from 'react-test-renderer';

import { NetworkContext } from '../../src/NetworkProvider';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';
import { SueReportRuntime } from '../../src/SueReportRuntime';
import { syncSueOutbox } from '../../src/helpers/sueReportSync';
import { subscribeSueOutbox } from '../../src/helpers/sueReportStorage';

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
    <SettingsContext.Provider
      value={{
        ...initialContext,
        globalSettings: {
          ...initialContext.globalSettings,
          settings: { sue: { apiConfig: { apiKey: 'test', serverUrl: 'https://example.test' } } }
        }
      }}
    >
      <NetworkContext.Provider value={{ isConnected, isMainserverUp: null }}>
        <SueReportRuntime />
      </NetworkContext.Provider>
    </SettingsContext.Provider>
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

it('does not start workers, subscriptions or timers when SUE is not configured', async () => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  const listener = jest.spyOn(AppState, 'addEventListener');
  const interval = jest.spyOn(global, 'setInterval');
  let tree: renderer.ReactTestRenderer;
  try {
    await renderer.act(async () => {
      tree = renderer.create(<SueReportRuntime />);
      jest.advanceTimersByTime(60_000);
    });
    expect(syncSueOutbox).not.toHaveBeenCalled();
    expect(subscribeSueOutbox).not.toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
    expect(interval).not.toHaveBeenCalled();
    await renderer.act(async () => tree!.unmount());
  } finally {
    jest.useRealTimers();
    jest.restoreAllMocks();
  }
});
