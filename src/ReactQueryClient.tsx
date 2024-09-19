import * as SecureStore from 'expo-secure-store';
import { GraphQLClient } from 'graphql-request';
import { namespace, secrets } from './config';

export const ReactQueryClient = async () => {
  const accessToken = await SecureStore.getItemAsync('ACCESS_TOKEN');

  return new GraphQLClient(`${secrets[namespace].serverUrl}${secrets[namespace].graphqlEndpoint}`, {
    headers: {
      authorization: accessToken ? `Bearer ${accessToken}` : ''
    }
  });
};
