import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';

import { bbBusUrl } from './config';

const httpLink = createHttpLink({
  uri: bbBusUrl
});

export const BBBusClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink
});
