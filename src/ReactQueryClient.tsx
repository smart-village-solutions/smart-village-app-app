import { GraphQLClient } from 'graphql-request';

import { namespace, secrets } from './config';
import { AUTH_MODE_PUBLIC, getGraphqlAuthHeaders, GraphqlAuthMode } from './graphqlAuth';

type ReactQueryRequestOptions = {
  authMode?: GraphqlAuthMode;
};

export const ReactQueryClient = async () => {
  const client = new GraphQLClient(
    `${secrets[namespace].serverUrl}${secrets[namespace].graphqlEndpoint}`
  );

  return {
    request: async (document, variables, options: ReactQueryRequestOptions = {}) => {
      const headers = await getGraphqlAuthHeaders(options.authMode ?? AUTH_MODE_PUBLIC);

      return client.request(document, variables, headers);
    }
  };
};
