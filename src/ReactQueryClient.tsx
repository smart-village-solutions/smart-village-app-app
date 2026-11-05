import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';

import { getMainServerConfig, getMainServerUrl } from './helpers/mainServerHelper';
import {
  AUTH_MODE_PUBLIC,
  getGraphqlAuthHeaders,
  getGraphqlCacheScope,
  GraphqlAuthMode
} from './graphqlAuth';

type ReactQueryRequestOptions = {
  authMode?: GraphqlAuthMode;
  locale?: string;
};

export const ReactQueryClient = async () => {
  const client = new GraphQLClient(`${getMainServerUrl()}${getMainServerConfig().graphqlEndpoint}`);

  return {
    cacheScope: async (authMode: GraphqlAuthMode = AUTH_MODE_PUBLIC, locale?: string) =>
      getGraphqlCacheScope(await getGraphqlAuthHeaders(authMode, locale)),
    rawRequest: async (document, variables, options: ReactQueryRequestOptions = {}) => {
      const headers = await getGraphqlAuthHeaders(
        options.authMode ?? AUTH_MODE_PUBLIC,
        options.locale
      );
      const scope = await getGraphqlCacheScope(headers);
      const response = await client.rawRequest(
        typeof document === 'string' ? document : print(document),
        variables,
        headers
      );

      return { ...response, scope };
    },
    request: async (document, variables, options: ReactQueryRequestOptions = {}) => {
      const headers = await getGraphqlAuthHeaders(
        options.authMode ?? AUTH_MODE_PUBLIC,
        options.locale
      );

      return client.request(document, variables, headers);
    }
  };
};
