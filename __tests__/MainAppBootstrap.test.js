import React from 'react';
import { act, render } from '@testing-library/react-native';
import { ApolloClient } from 'apollo-client';
import { persistCache } from 'apollo-cache-persist';

import { MainApp } from '../src';
import { auth } from '../src/auth';
import { storageHelper } from '../src/helpers';
import { NetworkContext } from '../src/NetworkProvider';

const mockQuery = jest.fn();
let mockLiveSettings;
let mockClient;
jest.mock('apollo-client', () => ({
  ApolloClient: jest.fn(({ cache }) => {
    mockClient = { cache, query: mockQuery };
    return mockClient;
  })
}));
jest.mock('apollo-cache-persist', () => ({ persistCache: jest.fn() }));
jest.mock('apollo-link-http', () => ({ createHttpLink: jest.fn() }));
jest.mock('apollo-link-context', () => ({ setContext: jest.fn() }));
jest.mock('apollo-link', () => ({ ApolloLink: { from: jest.fn() } }));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children
}));
jest.mock('react-apollo', () => ({ ApolloProvider: ({ children }) => children }));
jest.mock('../src/auth', () => ({ auth: jest.fn() }));
jest.mock('../src/graphqlAuth', () => ({
  AUTH_MODE_PUBLIC: 'public',
  getGraphqlAuthHeaders: jest.fn()
}));
jest.mock('../src/config', () => ({
  consts: { LIST_TYPES: {} },
  namespace: 'test',
  secrets: { test: { serverUrl: 'https://example.test/', graphqlEndpoint: 'graphql' } }
}));
jest.mock('../src/helpers', () => ({
  createEndOfDayExpiringStorage: jest.fn(),
  geoLocationToLocationObject: jest.fn(),
  graphqlFetchPolicy: ({ isMainserverUp }) => (isMainserverUp ? 'network-only' : 'cache-only'),
  parsedImageAspectRatio: jest.fn(),
  storageHelper: {
    globalSettings: jest.fn(),
    listTypesSettings: jest.fn(),
    locationSettings: jest.fn(),
    conversationSettings: jest.fn(),
    setGlobalSettings: jest.fn()
  }
}));
jest.mock('../src/queries', () => ({ getQuery: jest.fn(), QUERY_TYPES: {} }));
jest.mock('../src/NetworkProvider', () => ({
  NetworkContext: jest.requireActual('react').createContext({}),
  NetworkProvider: ({ children }) => children
}));
jest.mock('../src/navigation/Navigator', () => ({
  Navigator: () => {
    mockLiveSettings = jest
      .requireActual('react')
      .useContext(jest.requireActual('../src/SettingsProvider').SettingsContext);
    return null;
  }
}));
jest.mock('../src/components', () => ({
  OtaUpdateManager: () => null,
  VolunteerReportProvider: ({ children }) => children
}));
jest.mock('../src/WasteReminderRuntime', () => ({ WasteReminderRuntime: () => null }));
jest.mock('../src/ReactQueryProvider', () => ({
  ReactQueryCacheSettings: () => null,
  ReactQueryProvider: ({ children }) => children
}));
jest.mock('../src/AccessibilityProvider', () => ({
  AccessibilityProvider: ({ children }) => children
}));
jest.mock('../src/BookmarkProvider', () => ({ BookmarkProvider: ({ children }) => children }));
jest.mock('../src/ConfigurationsProvider', () => ({
  ConfigurationsProvider: ({ children }) => children
}));
jest.mock('../src/IconProvider', () => ({ IconProvider: ({ children }) => children }));
jest.mock('../src/OnboardingManager', () => ({ OnboardingManager: ({ children }) => children }));
jest.mock('../src/OrientationProvider', () => ({
  OrientationProvider: ({ children }) => children
}));
jest.mock('../src/PermanentFilterProvider', () => ({
  PermanentFilterProvider: ({ children }) => children
}));
jest.mock('../src/ProfileProvider', () => ({ ProfileProvider: ({ children }) => children }));
jest.mock('../src/UnreadMessagesProvider', () => ({
  UnreadMessagesProvider: ({ children }) => children
}));
jest.mock('../src/ThemeProvider', () => ({ AppThemeProvider: ({ children }) => children }));

const screen = (online) => (
  <NetworkContext.Provider value={{ isConnected: !!online, isMainserverUp: online }}>
    <MainApp />
  </NetworkContext.Provider>
);
const flush = async () => {
  await act(async () => {});
};

describe('MainApp Apollo bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLiveSettings = undefined;
    mockClient = undefined;
    auth.mockResolvedValue(undefined);
    persistCache.mockResolvedValue(undefined);
    storageHelper.globalSettings.mockResolvedValue({ navigation: 'tab', settings: {} });
    storageHelper.listTypesSettings.mockResolvedValue({});
    storageHelper.conversationSettings.mockResolvedValue({});
    mockQuery.mockResolvedValue({ data: {} });
  });

  afterEach(() => jest.restoreAllMocks());

  it('waits for a known network state then preserves live cache and user settings across reconnects', async () => {
    const view = render(screen(null));
    await flush();
    expect(ApolloClient).not.toHaveBeenCalled();
    view.rerender(screen(true));
    await flush();
    const originalClient = mockClient;
    originalClient.cache.writeData({ data: { liveValue: 'unsaved session data' } });
    const editedSettings = { navigation: 'drawer', settings: { userChoice: true } };
    await act(async () => mockLiveSettings.setGlobalSettings(editedSettings));
    const reads = storageHelper.globalSettings.mock.calls.length;
    const queries = mockQuery.mock.calls.length;
    auth.mockClear();

    view.rerender(screen(false));
    await flush();
    view.rerender(screen(true));
    await flush();

    expect(ApolloClient).toHaveBeenCalledTimes(1);
    expect(persistCache).toHaveBeenCalledTimes(1);
    expect(mockClient).toBe(originalClient);
    expect(originalClient.cache.extract().ROOT_QUERY.liveValue).toBe('unsaved session data');
    expect(mockLiveSettings.globalSettings).toBe(editedSettings);
    expect(storageHelper.globalSettings).toHaveBeenCalledTimes(reads);
    expect(mockQuery).toHaveBeenCalledTimes(queries);
    expect(auth).toHaveBeenCalledTimes(1);
  });

  it('does not overlap initialization while connectivity changes during cache hydration', async () => {
    let finishHydration;
    persistCache.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishHydration = resolve;
        })
    );
    const view = render(screen(false));
    await flush();
    view.rerender(screen(true));
    await flush();
    view.rerender(screen(false));
    await flush();
    view.rerender(screen(true));
    await flush();
    expect(persistCache).toHaveBeenCalledTimes(1);
    expect(ApolloClient).not.toHaveBeenCalled();

    await act(async () => finishHydration());
    expect(ApolloClient).toHaveBeenCalledTimes(1);
    expect(storageHelper.globalSettings).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockLiveSettings.globalSettings.navigation).toBe('tab');
    expect(auth).toHaveBeenCalledTimes(1);
  });

  it('retains the client when a failed settings hydration is retried on a later network change', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
    storageHelper.globalSettings.mockRejectedValueOnce(
      new Error('storage temporarily unavailable')
    );
    const view = render(screen(false));
    await flush();
    const originalClient = mockClient;
    expect(mockLiveSettings).toBeUndefined();
    view.rerender(screen(true));
    await flush();
    expect(mockLiveSettings).toBeDefined();
    expect(mockClient).toBe(originalClient);
    expect(ApolloClient).toHaveBeenCalledTimes(1);
    expect(persistCache).toHaveBeenCalledTimes(1);
    warning.mockRestore();
  });
  it('keeps one settings request in flight across connectivity changes', async () => {
    let finishSettings;
    mockQuery.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishSettings = resolve;
        })
    );
    const view = render(screen(true));
    await flush();
    const originalClient = mockClient;
    view.rerender(screen(false));
    await flush();
    view.rerender(screen(true));
    await flush();
    expect(mockQuery).toHaveBeenCalledTimes(1);
    await act(async () =>
      finishSettings({ data: { publicJsonFile: { content: { navigation: 'drawer' } } } })
    );
    expect(ApolloClient).toHaveBeenCalledTimes(1);
    expect(mockClient).toBe(originalClient);
    expect(storageHelper.setGlobalSettings).toHaveBeenCalledTimes(1);
    expect(mockLiveSettings.globalSettings.navigation).toBe('drawer');
  });

  it('preserves the initialized app when reconnect authentication fails', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const view = render(screen(false));
    await flush();
    const originalClient = mockClient;
    const originalSettings = mockLiveSettings.globalSettings;
    auth.mockRejectedValueOnce(new Error('temporary network failure'));
    view.rerender(screen(true));
    await flush();
    expect(mockClient).toBe(originalClient);
    expect(mockLiveSettings.globalSettings).toBe(originalSettings);
    expect(ApolloClient).toHaveBeenCalledTimes(1);
    expect(storageHelper.globalSettings).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      'Unable to refresh app authentication',
      expect.any(Error)
    );
  });
});
