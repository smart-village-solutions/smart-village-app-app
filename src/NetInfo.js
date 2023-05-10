import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

import { namespace, secrets } from './config';

// https://github.com/react-native-community/react-native-netinfo#netinfoconfiguration
NetInfo.configure({
  useNativeReachability: false,
  reachabilityUrl: `${secrets[namespace].serverUrl}/generate_204`,
  reachabilityShouldRun: () => AppState.currentState === 'active',
  reachabilityTest: async (response) => response.status === 204,
  reachabilityLongTimeout: 60 * 1000, // 60s
  reachabilityShortTimeout: 15 * 1000, // 15s
  reachabilityRequestTimeout: 10 * 1000 // 10s
});

export default NetInfo;
