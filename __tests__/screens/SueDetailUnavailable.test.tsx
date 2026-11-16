import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockRefetch = jest.fn();
let mockResult: { data: unknown; isLoading?: boolean };
jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: jest.requireActual('react').createContext({})
}));
jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: jest.requireActual('react').createContext({})
}));
jest.mock('react-query', () => ({ useQuery: () => ({ ...mockResult, refetch: mockRefetch }) }));
jest.mock('expo-router/js-tabs', () => ({ useBottomTabBarHeight: () => 0 }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 })
}));
jest.mock('react-native-status-bar-height', () => ({ getStatusBarHeight: () => 0 }));
jest.mock('react-native-elements', () => ({ Divider: () => null }));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({ useThemeStyles: () => ({}) }));
jest.mock('../../src/ReadAloudAvailabilityProvider', () => ({
  useReadAloudScrollContentContainerStyle: () => ({})
}));
jest.mock('../../src/helpers', () => ({ readFromStore: async () => undefined }));
jest.mock('../../src/config', () => ({
  texts: { sue: { unavailableReport: 'Report unavailable', retry: 'Retry' } }
}));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: { SUE: { REQUESTS_WITH_SERVICE_REQUEST_ID: 'report' } }
}));
jest.mock('../../src/components', () => {
  const { View, Text, Pressable } = jest.requireActual('react-native');
  return {
    Wrapper: View,
    RegularText: Text,
    Button: ({ title, onPress }: { title: string; onPress: () => void }) => (
      <Pressable onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
    LoadingContainer: View
  };
});
import { SueDetailScreen } from '../../src/screens/SUE/SueDetailScreen';

it.each([null, undefined])(
  'renders an unavailable report and retry for %s instead of destructuring it',
  (data) => {
    mockResult = { data, isLoading: false };
    const view = render(
      <SueDetailScreen
        {...({ route: { params: { queryVariables: { id: 'missing' } } } } as React.ComponentProps<
          typeof SueDetailScreen
        >)}
      />
    );
    expect(view.getByText('Report unavailable')).toBeTruthy();
    fireEvent.press(view.getByText('Retry'));
    expect(mockRefetch).toHaveBeenCalled();
  }
);
