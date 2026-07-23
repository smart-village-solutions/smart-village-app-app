import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ReactQuery from 'react-query';

jest.mock('react-query', () => {
  const mockClear = jest.fn();

  return {
    __mockClear: mockClear,
    QueryClient: jest.fn(() => ({
      clear: mockClear
    })),
    QueryClientProvider: ({ children }: { children?: React.ReactNode }) => children
  };
});

import { clearPersistentCaches } from '../src/ReactQueryProvider';

const reactQueryMock = ReactQuery as unknown as { __mockClear: jest.Mock };

describe('clearPersistentCaches', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('clears the in-memory react-query cache and persisted apollo cache entries', async () => {
    await AsyncStorage.setItem('apollo-cache-persist', 'apollo-cache');
    await AsyncStorage.setItem('apollo-cache-persist-extra', 'apollo-cache-extra');
    await AsyncStorage.setItem('globalSettings', 'settings');

    await clearPersistentCaches();

    expect(reactQueryMock.__mockClear).toHaveBeenCalledTimes(1);
    await expect(AsyncStorage.getItem('apollo-cache-persist')).resolves.toBeNull();
    await expect(AsyncStorage.getItem('apollo-cache-persist-extra')).resolves.toBeNull();
    await expect(AsyncStorage.getItem('globalSettings')).resolves.toBe('settings');
  });
});
