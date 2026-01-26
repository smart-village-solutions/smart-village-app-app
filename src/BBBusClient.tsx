import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { createHttpLink, UriFunction } from 'apollo-link-http';

/**
 * Creates a configured Apollo client for the BB-BUS GraphQL endpoint.
 *
 * @param uri GraphQL endpoint string or UriFunction provided by Apollo Link.
 */
export const BBBusClient = (uri: string | UriFunction) =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({ uri })
  });
