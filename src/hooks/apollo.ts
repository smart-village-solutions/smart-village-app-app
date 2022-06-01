import { useQuery } from 'react-apollo';

import { BBBusClient } from '../BBBusClient';
import { OParlClient } from '../OParlClient';
import { ConsulClient } from '../ConsulClient';

export const useOParlQuery: typeof useQuery = (query, options) => {
  return useQuery(query, { client: OParlClient, fetchPolicy: 'network-only', ...options });
};

export const useBBBusQuery: typeof useQuery = (query, options) => {
  return useQuery(query, { client: BBBusClient, fetchPolicy: 'network-only', ...options });
};

export const useConsulQuery: typeof useQuery = (query, options) => {
  return useQuery(query, { client: ConsulClient, fetchPolicy: 'network-only', ...options });
};
