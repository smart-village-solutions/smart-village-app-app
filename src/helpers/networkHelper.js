/**
 * Determine network status (online/offline) on the basis of NetInfo.getConnectionInfo()
 *
 * Currently used v 2.0.10:
 * https://github.com/react-native-community/react-native-netinfo/tree/v2.0.10
 *
 * @param {object} connectionInfo NetInfo connectionInfo object with a type
 *
 * @return {boolean} true if online, otherwise false
 */
export const isConnected = (connectionInfo) =>
  connectionInfo && (connectionInfo.type === 'wifi' || connectionInfo.type === 'cellular');
