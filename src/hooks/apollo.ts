import { useQuery } from 'react-apollo';
import { useContext } from 'react';

import { BBBusClient } from '../BBBusClient';
import { OParlClient } from '../OParlClient';
import { ConsulClient } from '../ConsulClient';
import { SettingsContext } from '../SettingsProvider';

export const useOParlQuery: typeof useQuery = (query, options) => {
  return useQuery(query, { client: OParlClient, fetchPolicy: 'network-only', ...options });
};

export const useBBBusQuery: typeof useQuery = (query, options) => {
  const { globalSettings } = useContext(SettingsContext);
  const uri = globalSettings?.settings?.busBb?.uri as string;

  return useQuery(query, { client: BBBusClient(uri), fetchPolicy: 'network-only', ...options });
};

export const useConsulQuery: typeof useQuery = (query, options) => {
  return useQuery(query, { client: ConsulClient, fetchPolicy: 'network-only', ...options });
};
