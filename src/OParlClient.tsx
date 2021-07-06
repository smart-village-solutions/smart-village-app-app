import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';

import { namespace, secrets } from './config';

const httpLink = createHttpLink({
  // @ts-expect-error expo slug is typed as a string, which is insufficient for type checking here.
  uri: secrets[namespace]?.oParl
});

export const OParlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink
});
