import { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';

import { graphqlFetchPolicy, isUpcomingDate, parseConstructionSite } from '../helpers';
import { filterForValidConstructionSites } from '../jsonValidation';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { ConstructionSite, ConstructionSitePayload, GenericItem } from '../types';

import { useRefreshTime } from './TimeHooks';

export const useConstructionSites = (queryVariables?: {
  ids?: string;
}): {
  constructionSites: ConstructionSite[];
  loading: boolean;
  refresh: () => void;
  refreshing: boolean;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);

  const refreshTime = useRefreshTime('construction-site');

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const { data, loading, refetch } = useQuery<{
    constructionSites: GenericItem<ConstructionSitePayload>[];
  }>(getQuery(QUERY_TYPES.CONSTRUCTION_SITES), {
    variables: queryVariables,
    fetchPolicy
  });

  const parsedConstructionSites = data?.constructionSites.map((entry) =>
    parseConstructionSite(entry)
  );

  const constructionSites = filterForValidConstructionSites(parsedConstructionSites);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await refetch?.();
    setRefreshing(false);
  }, [refetch]);

  return {
    constructionSites: constructionSites.filter(
      (value) => !value.endDate || isUpcomingDate(value.endDate)
    ),
    loading,
    refresh,
    refreshing
  };
};
