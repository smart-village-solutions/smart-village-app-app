import { useQuery } from 'react-apollo';
import { OParlClient } from '../OParlClient';

export const useOParlQuery: typeof useQuery = (query, options) => {
  return useQuery(query, { client: OParlClient, fetchPolicy: 'network-only', ...options });
};
