import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';

import { consul } from './config';
import { getConsulAuthToken } from './helpers';

const httpLink = createHttpLink({
  uri: consul.serverUrl + consul.graphqlEndpoint
});

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

export const ConsulClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink)
});
