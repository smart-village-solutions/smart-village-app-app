// MessageContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';

import { QUERY_TYPES, getQuery } from './queries';

const defaultUnreadMessage = { count: 0, loading: false };
const defaultPollInterval = 15 * 60 * 1000; // 15 minutes

export const UnreadMessagesContext = createContext(defaultUnreadMessage);

export const UnreadMessagesProvider = ({ children }: { children?: React.ReactNode }) => {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const query = QUERY_TYPES.PROFILE.GET_CONVERSATIONS;

  const { data: conversationData, loading } = useQuery(getQuery(query), {
    pollInterval: defaultPollInterval
  });

  const count = () => {
    let unreadMessageCount = 0;

    for (let i = 0; i < conversationData[query].length; i++) {
      const { unreadMessagesCount } = conversationData[query][i];
      unreadMessageCount += unreadMessagesCount;
    }

    return unreadMessageCount;
  };

  useEffect(() => {
    setUnreadMessagesCount(count());
  }, [conversationData]);

  return (
    <UnreadMessagesContext.Provider
      value={{
        count: unreadMessagesCount,
        loading
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useMessagesContext = () => useContext(UnreadMessagesContext);
