import NetInfo from '@react-native-community/netinfo';

/**
 * Fetch the current network status and determine a fetch policy for graphql queries.
 * If offline, only cache should be used.
 * If online, the graphql server should be queried.
 *
 * https://medium.com/@galen.corey/understanding-apollo-fetch-policies-705b5ad71980
 *
 * @return {string} a graphql fetch policy depending on the online/offline status
 */
export const netInfoForGraphqlFetchPolicy = async () => {
  const connectionInfo = await NetInfo.fetch();
  const { isConnected, isInternetReachable: isMainserverUp } = connectionInfo;

  return graphqlFetchPolicy({ isConnected, isMainserverUp });
};

/**
 * Determine a fetch policy for graphql queries depending on the network status.
 * If offline, only cache should be used.
 * If online, the graphql server should be queried.
 *
 * https://medium.com/@galen.corey/understanding-apollo-fetch-policies-705b5ad71980
 *
 * @return {string} a graphql fetch policy depending on the network status
 */
export const graphqlFetchPolicy = ({ isConnected, isMainserverUp, refreshTime }) => {
  if (isConnected && isMainserverUp) {
    // online and server up

    if (refreshTime) {
      const now = parseInt(Date.now() / 1000, 10); // in seconds from 01.01.1970 00:00:00 UTC

      if (now < refreshTime) {
        // use cached data from phone depending on update interval
        return 'cache-first';
      }
    }

    // use network data to fetch new data from server
    return 'network-only';
  }

  // offline or server down, use cached data from phone
  return 'cache-only';
};
