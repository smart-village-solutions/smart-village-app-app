// MessageContext.js

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';

import { useHomeRefresh } from './hooks';
import { useProfileContext } from './ProfileProvider';
import { QUERY_TYPES, getQuery } from './queries';

/**
 * Default context value used before the first conversations query completes.
 */
const defaultUnreadMessage = { count: 0, loading: false, refetch: () => {}, reset: () => {} };
/**
 * Delay between automatic refetches of unread message counts (15 minutes).
 */
const defaultPollInterval = 15 * 60 * 1000; // 15 minutes

/**
 * Holds the unread messages count together with loading status and helper callbacks.
 */
export const UnreadMessagesContext = createContext(defaultUnreadMessage);

/**
 * Fetches conversation data for logged-in users and pushes the unread message count into context.
 */
export const UnreadMessagesProvider = ({ children }: { children?: React.ReactNode }) => {
  const { isLoggedIn } = useProfileContext();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const query = QUERY_TYPES.PROFILE.GET_CONVERSATIONS;

  const {
    data: conversationData,
    loading,
    refetch
  } = useQuery(getQuery(query), {
    pollInterval: defaultPollInterval,
    skip: !isLoggedIn,
    variables: {
      conversationableType: 'GenericItem'
    }
  });

  useHomeRefresh(() => {
    isLoggedIn && refetch();
  });

  /**
   * Computes the number of unread messages from the latest GraphQL conversation payload.
   */
  const getUnreadMessagesCount = useCallback(() => {
    // return 0 if data is missing or not loaded yet
    if (!conversationData || !conversationData[query]) {
      return 0;
    }

    return conversationData[query].reduce((total, conversation) => {
      return total + (conversation.unreadMessagesCount || 0);
    }, 0);
  }, [conversationData]);

  useEffect(() => {
    setUnreadMessagesCount(getUnreadMessagesCount());
  }, [getUnreadMessagesCount]);

  useEffect(() => {
    isLoggedIn && refetch();
  }, [isLoggedIn]);

  return (
    <UnreadMessagesContext.Provider
      value={{
        count: unreadMessagesCount,
        loading,
        refetch,
        reset: () => setUnreadMessagesCount(0)
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

/**
 * Convenience hook for reading the `UnreadMessagesContext`.
 */
export const useMessagesContext = () => useContext(UnreadMessagesContext);
