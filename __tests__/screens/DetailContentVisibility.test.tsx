/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render } from '@testing-library/react-native';

import { DetailScreen } from '../../src/screens/DetailScreen';

let mockData: unknown;
const mockSpeechItems = jest.fn<{ text: string }[], [unknown]>(() => [{ text: 'Ordinary POI' }]);
const mockRegister = jest.fn();

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '5.0.0',
  nativeBuildVersion: '1573'
}));
jest.mock('react-query', () => ({ useQuery: () => ({ data: mockData, refetch: jest.fn() }) }));
jest.mock('../../src/AccessibilityProvider', () => ({
  AccessibilityContext: require('react').createContext({ features: { readAloud: true } })
}));
jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: require('react').createContext({ globalSettings: {} })
}));
jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: require('react').createContext({ isConnected: true, isMainserverUp: true })
}));
jest.mock('../../src/components', () => ({
  PointOfInterest: () => null,
  DetailActions: () => null,
  SafeAreaViewFlex: ({ children }: { children: React.ReactNode }) => children
}));
jest.mock('../../src/components/FeedbackFooter', () => ({ FeedbackFooter: () => null }));
jest.mock('../../src/config', () => ({ consts: { REFRESH_INTERVALS: {} }, texts: {} }));
jest.mock('../../src/graphqlAuth', () => ({ AUTH_MODE_PUBLIC: 'public' }));
jest.mock('../../src/helpers', () => ({ graphqlFetchPolicy: jest.fn() }));
jest.mock('../../src/helpers/accessibility/detailSpeechParser', () => ({
  getDetailSpeechItems: (options: unknown) => mockSpeechItems(options)
}));
jest.mock('../../src/hooks', () => ({ useRefreshTime: () => 1 }));
jest.mock('../../src/hooks/DetailRefresh', () => ({ DETAIL_REFRESH_EVENT: 'refresh' }));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/ReactQueryClient', () => ({ ReactQueryClient: jest.fn() }));
jest.mock('../../src/ReadAloudAvailabilityProvider', () => ({
  useReadAloudScrollContentContainerStyle: () => ({}),
  useRegisterReadAloudContent: (...args: unknown[]) => mockRegister(...args)
}));
jest.mock('../../src/queries', () => ({
  getQuery: jest.fn(),
  QUERY_TYPES: { POINT_OF_INTEREST: 'pointOfInterest', SUE: {} }
}));
jest.mock('../../src/types', () => ({ GenericType: {} }));
jest.mock('../../src/screens/DefectReport', () => ({ DefectReportFormScreen: () => null }));
jest.mock('../../src/screens/Noticeboard', () => ({ NoticeboardFormScreen: () => null }));
jest.mock('../../src/screens/SUE', () => ({ SueDetailScreen: () => null }));

it.each(['query', 'route'])(
  'keeps filtered %s details stable across read-aloud provider renders',
  (source) => {
    jest.clearAllMocks();
    const poi = {
      id: '1',
      vouchers: [{ id: 'ordinary' }, { id: 'restricted', payload: { minVersion: '6.0.0' } }]
    };
    mockData = source === 'query' ? { pointOfInterest: poi } : undefined;
    const props = {
      navigation: {},
      route: { params: { query: 'pointOfInterest', queryVariables: { id: '1' }, details: poi } }
    };
    const view = render(<DetailScreen {...props} />);
    const firstSpeechItems = mockRegister.mock.calls[0][1];
    view.rerender(<DetailScreen {...props} />);
    expect(mockSpeechItems).toHaveBeenCalledTimes(1);
    expect(mockSpeechItems).toHaveBeenCalledWith({
      detail: { id: '1', vouchers: [{ id: 'ordinary' }] },
      query: 'pointOfInterest'
    });
    expect(mockRegister.mock.calls[1][1]).toBe(firstSpeechItems);
    expect(poi.vouchers).toHaveLength(2);
  }
);
