import { useContext, useState } from 'react';
import { useQuery } from 'react-apollo';

import { ConsulClient } from '../ConsulClient';
import { OParlClient } from '../OParlClient';
import { SettingsContext } from '../SettingsProvider';

export const useOParlQuery: typeof useQuery = (query, options) => {
  const { globalSettings } = useContext(SettingsContext);
  const [client] = useState(OParlClient(globalSettings?.settings?.oParl?.uri));

  return useQuery(query, { client, fetchPolicy: 'network-only', ...options });
};

export const useBBBusQuery: typeof useQuery = (query, options) => {
  const { globalSettings } = useContext(SettingsContext);
  const [client] = useState(OParlClient(globalSettings?.settings?.busBb?.uri));

  return useQuery(query, { client, fetchPolicy: 'network-only', ...options });
};

export const useConsulQuery: typeof useQuery = (query, options) => {
  return useQuery(query, { client: ConsulClient, fetchPolicy: 'network-only', ...options });
};
