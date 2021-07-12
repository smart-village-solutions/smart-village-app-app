import { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';

import { graphqlFetchPolicy, isUpcomingDate } from '../helpers';
import { filterForValidConstructionSites } from '../jsonValidation';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { ConstructionSite, GenericItem } from '../types';

type Payload = {
  direction?: string;
  cause?: string;
  restrictions?: Array<{
    description: string;
  }>;
};

const parseConstructionSite = (
  constructionSite: GenericItem<Payload>
): Partial<ConstructionSite> => {
  let location:
    | {
        lat: number;
        lon: number;
      }
    | undefined;
  if (constructionSite?.locations?.[0]?.geoLocation) {
    location = {
      lat: constructionSite.locations?.[0].geoLocation?.latitude,
      lon: constructionSite.locations?.[0].geoLocation?.longitude
    };
  }

  return {
    id: constructionSite.id,
    startDate: constructionSite.dates?.[0]?.dateStart,
    title: constructionSite.title,
    category: constructionSite.categories?.[0]?.name,
    cause: constructionSite.payload.cause,
    description: constructionSite.contentBlocks?.[0]?.body,
    direction: constructionSite.payload.direction,
    endDate: constructionSite.dates?.[0]?.dateEnd,
    imageUri: constructionSite.mediaContents?.[0]?.sourceUrl.url,
    location,
    locationDescription: undefined, // TODO: add location description once it is available
    restrictions: constructionSite.payload.restrictions?.map((value) => value.description)
  };
};

export const useConstructionSites = (
  id?: string
): {
  constructionSites: ConstructionSite[];
  loading: boolean;
  refresh: () => void;
  refreshing: boolean;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  const { data, loading, refetch } = useQuery<{ constructionSites: GenericItem<Payload>[] }>(
    getQuery(QUERY_TYPES.CONSTRUCTION_SITES),
    {
      variables: { ids: id },
      fetchPolicy
    }
  );

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
