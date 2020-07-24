import PropTypes from 'prop-types';
import React, { createContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

import appJson from '../app.json';
import { secrets } from './config';

const defaultIsConnected = false;
const defaultIsMainserverUp = false;

export const NetworkContext = createContext({
  isConnected: defaultIsConnected,
  isMainserverUp: defaultIsMainserverUp
});

const namespace = appJson.expo.slug;

// https://github.com/react-native-community/react-native-netinfo#netinfoconfiguration
NetInfo.configure({
  reachabilityUrl: `${secrets[namespace].serverUrl}/generate_204`,
  reachabilityTest: async (response) => response.status === 204,
  reachabilityLongTimeout: 60 * 1000, // 60s
  reachabilityShortTimeout: 15 * 1000, // 15s
  reachabilityRequestTimeout: 10 * 1000 // 10s
});

export const NetworkProvider = ({ children }) => {
  const [connected, setConnected] = useState(defaultIsConnected);
  const [internetReachable, setInternetReachable] = useState(defaultIsMainserverUp);

  useEffect(() => {
    // https://github.com/react-native-community/react-native-netinfo#netinfostate
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnected(state.isConnected);
      setInternetReachable(state.isInternetReachable);
    });

    // returned function will be called on component unmount
    return () => unsubscribe();
  }, []);

  // TODO: remove logs
  // console.log('NetworkProvider isConnected', connected);
  // console.log('NetworkProvider isMainserverUp', internetReachable);

  return (
    <NetworkContext.Provider value={{ isConnected: connected, isMainserverUp: internetReachable }}>
      {children}
    </NetworkContext.Provider>
  );
};

NetworkProvider.propTypes = {
  children: PropTypes.object.isRequired
};
