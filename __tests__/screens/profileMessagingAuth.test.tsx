/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { AUTH_MODE_USER, getApolloAuthContext } from '../../src/graphqlAuth';
import { CREATE_MESSAGE, MARK_MESSAGES_AS_READ } from '../../src/queries/profile';
import { ProfileConversationsScreen } from '../../src/screens/profile/ProfileConversationsScreen';
import { ProfileMessagingScreen } from '../../src/screens/profile/ProfileMessagingScreen';

const mockUseMutation = jest.fn();
const mockUseQuery = jest.fn();

jest.mock('react-apollo', () => ({
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useQuery: (...args: unknown[]) => mockUseQuery(...args)
}));

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: jest.fn()
}));

jest.mock('../../src/components', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Button: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
    Chat: () => <View />,
    EmptyMessage: () => <View />,
    ListComponent: () => <View />,
    LoadingSpinner: () => <View />,
    SafeAreaViewFlex: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
    Wrapper: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>
  };
});

jest.mock('../../src/config', () => ({
  colors: {},
  normalize: (value: number) => value,
  texts: {
    empty: { list: 'Empty' },
    noticeboard: { toRelated: 'Related' }
  }
}));

jest.mock('../../src/helpers', () => ({
  parseListItemsFromQuery: jest.fn(() => []),
  shareMessage: jest.fn(() => '')
}));

jest.mock('../../src/ProfileProvider', () => ({
  useProfileContext: () => ({ currentUserData: { member: { id: 14808 } } })
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    GENERIC_ITEM: 'genericItem',
    PROFILE: {
      GET_CONVERSATIONS: 'getConversations',
      GET_MESSAGES: 'getMessages'
    }
  },
  getQuery: (query: string) => `query:${query}`
}));

jest.mock('../../src/queries/profile', () => ({
  CREATE_MESSAGE: 'createMessage',
  MARK_MESSAGES_AS_READ: 'markMessagesAsRead'
}));

jest.mock('../../src/SettingsProvider', () => {
  const React = require('react');

  return {
    SettingsContext: React.createContext({ conversationSettings: {} })
  };
});

jest.mock('../../src/types', () => ({
  ScreenName: {
    Detail: 'Detail',
    Noticeboard: 'Noticeboard'
  }
}));

jest.mock('../../src/UnreadMessagesProvider', () => ({
  useMessagesContext: () => ({ refetch: jest.fn() })
}));

const navigation = {
  push: jest.fn()
} as any;

const renderComponent = async (component: React.ReactElement) => {
  await act(async () => {
    renderer.create(component);
  });
};

describe('profile messaging auth context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutation.mockReturnValue([jest.fn(), {}]);
    mockUseQuery.mockReturnValue({
      data: {},
      loading: false,
      refetch: jest.fn()
    });
  });

  it('loads the current user conversations with user auth', async () => {
    await renderComponent(<ProfileConversationsScreen navigation={navigation} route={{} as any} />);

    expect(mockUseQuery).toHaveBeenCalledWith('query:getConversations', {
      ...getApolloAuthContext(AUTH_MODE_USER),
      pollInterval: 10000
    });
  });

  it('loads, sends and marks messages with user auth', async () => {
    await renderComponent(
      <ProfileMessagingScreen
        navigation={navigation}
        route={
          {
            params: {
              query: 'getMessages',
              queryVariables: { id: 42 }
            }
          } as any
        }
      />
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      'query:getMessages',
      expect.objectContaining({
        ...getApolloAuthContext(AUTH_MODE_USER),
        variables: { conversationId: 42 }
      })
    );
    expect(mockUseMutation).toHaveBeenNthCalledWith(
      1,
      CREATE_MESSAGE,
      getApolloAuthContext(AUTH_MODE_USER)
    );
    expect(mockUseMutation).toHaveBeenNthCalledWith(
      2,
      MARK_MESSAGES_AS_READ,
      getApolloAuthContext(AUTH_MODE_USER)
    );
  });
});
