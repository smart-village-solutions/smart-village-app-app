import PropTypes from 'prop-types';
import React, { createContext, useEffect, useState } from 'react';

import NetInfo from './NetInfo';

const defaultIsConnected = false;
const defaultIsMainserverUp = null;

export const NetworkContext = createContext({
  isConnected: defaultIsConnected,
  isMainserverUp: defaultIsMainserverUp
});

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(defaultIsConnected);
  const [isMainserverUp, setIsMainserverUp] = useState(defaultIsMainserverUp);

  useEffect(() => {
    // https://github.com/react-native-community/react-native-netinfo#netinfostate
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      // NOTE: Somehow on iOS there is always `null` for `state.isInternetReachable` but we need it
      // to be `true` to not fallback to cached data. If there is a connection, we assume the main
      // server is also reachable, so we fallback to `state.isConnected` here.
      // With cached data on the initial app load, we cannot show anything and get stuck on the
      // splash screen.
      setIsMainserverUp(state.isInternetReachable || state.isConnected);
    });

    return () => {
      // Unsubscribe to network state updates when component unmounts
      unsubscribe();
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, isMainserverUp }}>
      {children}
    </NetworkContext.Provider>
  );
};

NetworkProvider.propTypes = {
  children: PropTypes.object.isRequired
};
