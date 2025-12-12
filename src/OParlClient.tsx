import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { createHttpLink, UriFunction } from 'apollo-link-http';

/**
 * Creates an Apollo client instance for OParl GraphQL endpoints.
 */
export const OParlClient = (uri: string | UriFunction) =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({ uri })
  });
