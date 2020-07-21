import PropTypes from 'prop-types';
import React, { createContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const NetworkContext = createContext({ isConnected: false });

export const NetworkProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => setConnected(state.isConnected));

    // returned function will be called on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected: connected }}>{children}</NetworkContext.Provider>
  );
};

NetworkProvider.propTypes = {
  children: PropTypes.object.isRequired
};
