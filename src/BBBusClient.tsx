import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';

import { bbBusUrlV2 } from './config';

const httpLink = createHttpLink({
  uri: bbBusUrlV2
});

export const BBBusClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink
});
