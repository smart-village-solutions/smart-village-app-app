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
      setIsMainserverUp(state.isInternetReachable);
    });

    // returned function will be called when component unmounts
    return () => unsubscribe();
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
