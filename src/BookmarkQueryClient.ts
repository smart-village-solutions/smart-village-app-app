import { getQuery } from './queries';
import { ReactQueryClient } from './ReactQueryClient';

export const requestBookmarkData = async (query: string, variables: Record<string, unknown>) => {
  const queryDocument = getQuery(query);

  if (typeof queryDocument === 'function') {
    return queryDocument(variables);
  }

  const client = await ReactQueryClient();

  return client.request(queryDocument, variables);
};
