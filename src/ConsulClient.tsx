import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { createHttpLink } from 'apollo-link-http';

import { namespace, secrets } from './config';
import { getConsulAuthToken } from './helpers';

/** HTTP link used for all Consul GraphQL requests. */
const httpLink = createHttpLink({
  // @ts-expect-error expo slug is typed as a string, which is insufficient for type checking here.
  uri: `${secrets[namespace]?.consul?.serverUrl}${secrets[namespace]?.consul?.graphqlEndpoint}`
});

/** Injects Consul auth headers from local storage before each request. */
const authLink = setContext(async () => {
  // get the authentication token from local storage if it exists
  const token = await getConsulAuthToken();
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      'access-token': token ? `${JSON.parse(token).accessToken}` : '',
      client: token ? `${JSON.parse(token).client}` : '',
      uid: token ? `${JSON.parse(token).uid}` : ''
    }
  };
});

/** Shared Apollo client instance for Consul interactions (news, polls, proposals, etc.). */
export const ConsulClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink)
});
