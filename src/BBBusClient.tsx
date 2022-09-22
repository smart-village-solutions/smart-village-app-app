import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { createHttpLink, UriFunction } from 'apollo-link-http';

export const BBBusClient = (uri: string | UriFunction) =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({ uri })
  });
