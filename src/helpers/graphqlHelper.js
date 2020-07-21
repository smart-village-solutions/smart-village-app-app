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

  return graphqlFetchPolicy(connectionInfo.isConnected);
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
export const graphqlFetchPolicy = (isConnected) => {
  if (isConnected) {
    // online, use network data
    return 'network-only';
  }

  // offline, use cached data
  return 'cache-only';
};
