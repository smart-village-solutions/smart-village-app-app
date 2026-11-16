/* eslint-disable react/prop-types */
import { act, render } from '@testing-library/react-native';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { profileAuthToken, profileUserData, storeTokens } from '../../src/helpers';
import { NoticeboardIndexScreen } from '../../src/screens/Noticeboard/NoticeboardIndexScreen';

let mockFocused = true;
const mockRefetch = jest.fn();
jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: (callback) => {
    const { useEffect } = jest.requireActual('react');
    const focused = mockFocused;
    useEffect(() => (focused ? callback() : undefined), [callback, focused]);
  }
}));
jest.mock('react-apollo', () => ({
  useQuery: () => ({ data: undefined, loading: false, refetch: mockRefetch })
}));
jest.mock('react-query', () => ({ useQuery: () => ({ isLoading: false }) }));
jest.mock('../../src/helpers', () => ({
  filterTypesHelper: () => [],
  graphqlFetchPolicy: () => 'cache-first',
  resolveNoticeboardScope: () => ({ authMode: 'public', currentMember: false }),
  parseListItemsFromQuery: () => [],
  profileAuthToken: jest.fn(),
  profileUserData: jest.fn(),
  storeProfileUserData: jest.fn(),
  storeTokens: jest.fn(),
  updateResourceFiltersStateHelper: jest.fn()
}));
jest.mock('../../src/hooks', () => ({ useStaticContent: () => ({}) }));
jest.mock('../../src/config', () => ({
  Icon: {},
  texts: { noticeboard: { emptyTitle: 'No items' } }
}));
jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: jest.requireActual('react').createContext({ resourceFilters: {} })
}));
jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: jest
    .requireActual('react')
    .createContext({ isConnected: true, isMainserverUp: true })
}));
jest.mock('../../src/PermanentFilterProvider', () => ({
  PermanentFilterContext: jest.requireActual('react').createContext({ resourceFiltersState: {} })
}));
jest.mock('../../src/queries', () => ({
  getQuery: () => ({}),
  QUERY_TYPES: { PROFILE: { MEMBER: 'member' } }
}));
jest.mock('../../src/queries/profile', () => ({ member: jest.fn() }));
jest.mock('../../src/types', () => ({ GenericType: { Noticeboard: 'noticeboard' } }));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles) => createStyles({})
}));
jest.mock('../../src/screens/NestedInfoScreen', () => ({ ListHeaderComponent: () => null }));
jest.mock('../../src/screens/profile', () => ({ ProfileUpdateScreen: () => null }));
jest.mock('../../src/components', () => {
  const { Text, View } = jest.requireActual('react-native');
  const Wrapper = ({ children }) => <View>{children}</View>;
  return {
    Button: () => null,
    EmptyMessage: ({ title }) => <Text>{title}</Text>,
    Filter: () => null,
    ListComponent: () => null,
    LoadingContainer: Wrapper,
    LoginModal: () => <Text>Login required</Text>,
    navigateWithSubQuery: jest.fn(),
    NoticeboardCategoryTabs: () => null,
    SafeAreaViewFlex: Wrapper,
    Wrapper,
    WrapperHorizontal: Wrapper
  };
});

const screen = () => (
  <NoticeboardIndexScreen navigation={{}} route={{ params: { isLoginRequired: true } }} />
);
const flush = async () => act(async () => {});

beforeEach(() => {
  jest.clearAllMocks();
  mockFocused = true;
  profileAuthToken.mockResolvedValue('existing-token');
  profileUserData.mockResolvedValue({
    currentUserData: { member: { preferences: { name: 'saved' } } }
  });
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

it('clears the loading indicator after a credential read failure without deleting credentials', async () => {
  profileAuthToken.mockRejectedValueOnce(new Error('SecureStore unavailable'));
  const tree = render(screen());
  await flush();

  expect(tree.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  expect(tree.getByText('No items')).toBeTruthy();
  expect(storeTokens).not.toHaveBeenCalled();
});

it('preserves the current login after a later focused read fails', async () => {
  const tree = render(screen());
  await flush();
  expect(tree.queryByText('Login required')).toBeNull();
  mockFocused = false;
  tree.rerender(screen());
  profileAuthToken.mockRejectedValueOnce(new Error('SecureStore unavailable'));
  mockFocused = true;
  tree.rerender(screen());
  await flush();

  expect(tree.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  expect(tree.queryByText('Login required')).toBeNull();
  expect(storeTokens).not.toHaveBeenCalled();
});

it('ignores a stale login read after blur and a newer successful focus', async () => {
  let finishOldRead;
  profileAuthToken.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishOldRead = resolve;
      })
  );
  const tree = render(screen());
  mockFocused = false;
  tree.rerender(screen());
  mockFocused = true;
  tree.rerender(screen());
  await flush();
  await act(async () => finishOldRead(null));

  expect(tree.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  expect(tree.queryByText('Login required')).toBeNull();
});
