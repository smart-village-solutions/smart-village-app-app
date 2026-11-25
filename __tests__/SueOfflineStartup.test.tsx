import React from 'react';
import renderer from 'react-test-renderer';

import { MainApp } from '../src';
import { auth } from '../src/auth';
import { storageHelper } from '../src/helpers';
import { NetworkContext } from '../src/NetworkProvider';

const mockQuery = jest.fn();
const mockNavigate = jest.fn(() => null);
const mockPassThrough = ({ children }: { children?: React.ReactNode }) => children;

jest.mock('../src/config', () => ({
  consts: { LIST_TYPES: {} },
  namespace: 'test',
  secrets: { test: { serverUrl: 'https://main.test', graphqlEndpoint: '/graphql' } }
}));
jest.mock('../src/auth', () => ({ auth: jest.fn(async (callback) => callback?.()) }));
jest.mock('../src/helpers', () => ({
  createEndOfDayExpiringStorage: jest.fn(),
  geoLocationToLocationObject: jest.fn(),
  graphqlFetchPolicy: ({ isConnected }) => (isConnected ? 'network-only' : 'cache-only'),
  hasSueApiConfiguration: jest.requireActual('../src/helpers/sueHelper').hasSueApiConfiguration,
  parsedImageAspectRatio: jest.fn(),
  storageHelper: {
    globalSettings: jest.fn(),
    setGlobalSettings: jest.fn(),
    listTypesSettings: jest.fn(),
    locationSettings: jest.fn(),
    conversationSettings: jest.fn()
  }
}));
jest.mock('../src/graphqlAuth', () => ({ getGraphqlAuthHeaders: jest.fn() }));
jest.mock('apollo-client', () => ({
  ApolloClient: class {
    query = mockQuery;
  }
}));
jest.mock('apollo-cache-inmemory', () => ({ InMemoryCache: class {} }));
jest.mock('apollo-cache-persist', () => ({ persistCache: jest.fn() }));
jest.mock('apollo-link', () => ({ ApolloLink: { from: jest.fn() } }));
jest.mock('apollo-link-context', () => ({ setContext: jest.fn() }));
jest.mock('apollo-link-http', () => ({ createHttpLink: jest.fn() }));
jest.mock('react-apollo', () => ({ ApolloProvider: (props) => mockPassThrough(props) }));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: (props) => mockPassThrough(props)
}));
jest.mock('../src/NetworkProvider', () => ({
  NetworkContext: jest.requireActual('react').createContext({}),
  NetworkProvider: (props) => mockPassThrough(props)
}));
jest.mock('../src/AccessibilityProvider', () => ({
  AccessibilityProvider: (props) => mockPassThrough(props)
}));
jest.mock('../src/BookmarkProvider', () => ({
  BookmarkProvider: (props) => mockPassThrough(props)
}));
jest.mock('../src/ConfigurationsProvider', () => ({
  ConfigurationsProvider: (props) => mockPassThrough(props)
}));
jest.mock('../src/IconProvider', () => ({ IconProvider: (props) => mockPassThrough(props) }));
jest.mock('../src/OnboardingManager', () => ({
  OnboardingManager: (props) => mockPassThrough(props)
}));
jest.mock('../src/OrientationProvider', () => ({
  OrientationProvider: (props) => mockPassThrough(props)
}));
jest.mock('../src/PermanentFilterProvider', () => ({
  PermanentFilterProvider: (props) => mockPassThrough(props)
}));
jest.mock('../src/ProfileProvider', () => ({ ProfileProvider: (props) => mockPassThrough(props) }));
jest.mock('../src/ThemeProvider', () => ({ AppThemeProvider: (props) => mockPassThrough(props) }));
jest.mock('../src/UnreadMessagesProvider', () => ({
  UnreadMessagesProvider: (props) => mockPassThrough(props)
}));
jest.mock('../src/ReactQueryProvider', () => ({
  ReactQueryProvider: (props) => mockPassThrough(props),
  ReactQueryCacheSettings: () => null
}));
jest.mock('../src/navigation/Navigator', () => ({ Navigator: (props) => mockNavigate(props) }));
jest.mock('../src/SueReportRuntime', () => ({ SueReportRuntime: () => null }));
jest.mock('../src/WasteReminderRuntime', () => ({ WasteReminderRuntime: () => null }));
jest.mock('../src/components', () => ({
  OtaUpdateManager: () => null,
  VolunteerReportProvider: (props) => mockPassThrough(props)
}));
jest.mock('../src/queries', () => ({
  getQuery: jest.fn(),
  QUERY_TYPES: { PUBLIC_JSON_FILE: 'settings' }
}));

const mount = async (isConnected: boolean) => {
  let tree: renderer.ReactTestRenderer;
  await renderer.act(async () => {
    tree = renderer.create(
      <NetworkContext.Provider value={{ isConnected, isMainserverUp: isConnected }}>
        <MainApp />
      </NetworkContext.Provider>
    );
  });
  return tree!;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({ data: {} });
  (storageHelper.globalSettings as jest.Mock).mockResolvedValue({
    settings: {},
    navigation: 'tab'
  });
});

it('opens an installed SUE app offline without token refresh or a populated Apollo cache', async () => {
  (storageHelper.globalSettings as jest.Mock).mockResolvedValue({
    settings: { sue: { apiConfig: { apiKey: 'test', serverUrl: 'https://sue.test' } } },
    navigation: 'tab'
  });
  const tree = await mount(false);
  expect(auth).not.toHaveBeenCalled();
  expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({ fetchPolicy: 'cache-only' }));
  expect(mockNavigate).toHaveBeenCalled();
  renderer.act(() => tree.unmount());
});

it('preserves the existing authentication path when SUE is not configured', async () => {
  const tree = await mount(false);
  expect(auth).toHaveBeenCalled();
  expect(mockQuery).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
  renderer.act(() => tree.unmount());
});

it('preserves network loading and authentication for connected apps', async () => {
  const tree = await mount(true);
  expect(auth).toHaveBeenCalled();
  expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({ fetchPolicy: 'network-only' }));
  expect(mockNavigate).toHaveBeenCalled();
  renderer.act(() => tree.unmount());
});

it('still starts SUE delivery when main-server authentication fails on a connected network', async () => {
  (storageHelper.globalSettings as jest.Mock).mockResolvedValue({
    settings: { sue: { apiConfig: { apiKey: 'test', serverUrl: 'https://sue.test' } } },
    navigation: 'tab'
  });
  (auth as jest.Mock).mockRejectedValueOnce(new Error('Main server unavailable'));
  (auth as jest.Mock).mockRejectedValueOnce(new Error('Main server unavailable'));
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const tree = await mount(true);
    expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({ fetchPolicy: 'cache-only' }));
    expect(mockNavigate).toHaveBeenCalled();
    renderer.act(() => tree.unmount());
  } finally {
    warn.mockRestore();
  }
});
