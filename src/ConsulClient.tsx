import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';

import { consul } from './config';

const link = createHttpLink({
  uri: consul
});

export const ConsulClient = new ApolloClient({
  cache: new InMemoryCache(),
  link
});
