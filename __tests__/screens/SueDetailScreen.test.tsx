import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from 'react-query';

import { SueDetailScreen } from '../../src/screens/SUE/SueDetailScreen';

const mockSavedReports = jest.fn();
const mockOfficialReport = jest.fn();

jest.mock('expo-router/js-tabs', () => ({ useBottomTabBarHeight: () => 0 }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0 })
}));
jest.mock('react-native-status-bar-height', () => ({ getStatusBarHeight: () => 0 }));
jest.mock('react-native-elements', () => ({
  Divider: jest.requireActual<typeof import('react-native')>('react-native').View
}));
jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: jest.requireActual<typeof React>('react').createContext({
    appDesignSystem: {
      sueStatus: {
        statuses: [
          { status: 'Open', matchingStatuses: ['open'] },
          { status: 'Closed', matchingStatuses: ['closed'] }
        ]
      }
    },
    sueConfig: {}
  })
}));
jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: jest.requireActual<typeof React>('react').createContext({
    isConnected: true,
    isMainserverUp: false
  })
}));
jest.mock('../../src/ReadAloudAvailabilityProvider', () => ({
  useReadAloudScrollContentContainerStyle: () => undefined
}));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/config', () => ({
  SUE_MY_REPORTS: 'savedReports',
  device: {},
  normalize: (value: number) => value,
  texts: { sue: {} }
}));
jest.mock('../../src/helpers', () => ({
  readFromStore: jest.fn().mockResolvedValue(null),
  getVisibleSueStatus: (report: { status?: string }) => report.status
}));
jest.mock('../../src/types', () => ({ ScreenName: { Detail: 'Detail' } }));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    SUE: {
      REQUESTS_WITH_SERVICE_REQUEST_ID: 'officialDetail',
      MY_REQUEST_WITH_SERVICE_REQUEST_ID: 'savedDetail',
      MY_REQUESTS: 'myRequests'
    }
  },
  getQuery: (query: string) => (query === 'myRequests' ? mockSavedReports : mockOfficialReport)
}));
jest.mock('../../src/components', () => {
  const ReactLocal = jest.requireActual<typeof React>('react');
  const { Text, View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    BoldText: Text,
    Button: () => null,
    HtmlView: () => null,
    ImageSection: () => null,
    LoadingContainer: View,
    MapLibre: () => null,
    ReadAloudContent: () => null,
    RegularText: Text,
    SafeAreaViewFlex: View,
    SueCategory: () => null,
    SueDatetime: () => null,
    SueStatus: ({ status, tagName }: { status?: string; tagName?: string }) =>
      ReactLocal.createElement(
        View,
        null,
        ReactLocal.createElement(Text, null, status),
        ReactLocal.createElement(Text, null, tagName)
      ),
    SueStatuses: () => null,
    Wrapper: View,
    WrapperHorizontal: View
  };
});

const oldReport = { serviceRequestId: 123, status: 'open', tagName: 'Old keyword' };
const freshReport = { ...oldReport, status: 'closed', tagName: 'New keyword' };

describe('saved SUE detail refresh', () => {
  let client: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    client = new QueryClient({
      defaultOptions: { queries: { refetchOnMount: false, retry: false, cacheTime: Infinity } }
    });
    mockOfficialReport.mockResolvedValue(oldReport);
    mockSavedReports.mockResolvedValue([oldReport]);
  });

  afterEach(() => {
    client.clear();
    jest.restoreAllMocks();
  });

  const openDetail = (report = oldReport) =>
    render(
      <QueryClientProvider client={client}>
        <SueDetailScreen
          navigation={{ push: jest.fn() } as never}
          route={
            {
              params: { query: 'savedDetail', queryVariables: { id: 123 }, details: report }
            } as never
          }
        />
      </QueryClientProvider>
    );

  it('reads updated keywords and status when reopening a cached saved detail', async () => {
    const first = openDetail();
    await waitFor(() => expect(mockSavedReports).toHaveBeenCalledTimes(1));
    await first.findByText('Old keyword');
    first.unmount();

    // The refreshed saved-report list has persisted new server data.
    mockSavedReports.mockResolvedValue([freshReport]);
    const reopened = openDetail(freshReport);

    await reopened.findByText('New keyword');
    expect(reopened.getByText('Closed')).toBeTruthy();
    expect(mockSavedReports).toHaveBeenCalledTimes(2);
    reopened.unmount();
  });

  it('keeps the cached report if a fresh storage read fails on reopening', async () => {
    const first = openDetail();
    await waitFor(() => expect(client.getQueryState(['savedDetail', 123])?.status).toBe('success'));
    first.unmount();

    mockSavedReports.mockRejectedValue(new Error('Temporary storage failure'));
    const reopened = openDetail();

    await waitFor(() => expect(client.getQueryState(['savedDetail', 123])?.status).toBe('error'));
    expect(reopened.getByText('Old keyword')).toBeTruthy();
    expect(reopened.getByText('Open')).toBeTruthy();
    reopened.unmount();
  });

  it('keeps route data when the first saved-report lookup fails', async () => {
    mockSavedReports.mockRejectedValue(new Error('Temporary storage failure'));
    const screen = openDetail();

    await waitFor(() => expect(client.getQueryState(['savedDetail', 123])?.status).toBe('error'));
    expect(screen.getByText('Old keyword')).toBeTruthy();
    expect(screen.getByText('Open')).toBeTruthy();
    screen.unmount();
  });
});
