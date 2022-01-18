import { useQuery } from 'react-apollo';

import { BBBusClient } from '../BBBusClient';
import { OParlClient } from '../OParlClient';

export const useOParlQuery: typeof useQuery = (query, options) => {
  return useQuery(query, { client: OParlClient, fetchPolicy: 'network-only', ...options });
};

export const useBBBusQuery: typeof useQuery = (query, options) => {
  return useQuery(query, { client: BBBusClient, fetchPolicy: 'network-only', ...options });
};
