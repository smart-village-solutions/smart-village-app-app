import _sortBy from 'lodash/sortBy';
import { useContext } from 'react';
import { useQuery } from 'react-query';

import {
  findPublicServices,
  getPoliticalArea,
  getPublicService,
  searchPoliticalAreas
} from '../queries/bus';
import { SettingsContext } from '../SettingsProvider';
import type {
  AreaId,
  BusAreaSearchResult,
  BusServiceArgs,
  BusServiceDetail,
  BusServiceListItem,
  BusSettings,
  BusSettingsContextValue,
  PoliticalArea
} from '../types';

import { useStaticContent } from './staticContent';

const BUS_QUERY_KEYS = {
  AREAS: 'areas',
  ROOT: 'bus',
  SERVICE: 'service',
  SERVICES: 'services',
  INITIAL_AREA: 'initial-area',
  TOP10: 'top10'
} as const;

// Avoid leaking the raw API key into React Query devtools while still changing the cache key
// when credentials change.
const getHashedKeyPart = (value?: string) => {
  if (!value) {
    return '';
  }

  let hash = 0;

  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    hash = Math.trunc(Math.imul(31, hash) + codePoint);
  }

  return `${hash}`;
};

// Include the BUS endpoint and a non-reversible API key fingerprint in query keys so cached
// results are separated when BUS settings change at runtime.
export const getBusQueryConfigKey = (bus: Pick<BusSettings, 'apiKey' | 'uri'> = {}) => {
  return `${bus.uri ?? ''}::${getHashedKeyPart(bus.apiKey)}`;
};

const useBusSettings = (): BusSettings => {
  const { globalSettings } = useContext(SettingsContext) as BusSettingsContextValue;
  return globalSettings?.settings?.bus ?? {};
};

export const useBusAreas = (searchTerm: string = '', isEnabled: boolean = true) => {
  const bus = useBusSettings();
  const hasBusConfig = !!bus.uri;
  const isQueryEnabled = isEnabled && hasBusConfig && searchTerm.trim().length >= 3;

  const { data, error, isError, isFetching, isLoading, refetch } = useQuery<
    BusAreaSearchResult[],
    Error
  >(
    [BUS_QUERY_KEYS.ROOT, BUS_QUERY_KEYS.AREAS, searchTerm],
    () => searchPoliticalAreas({ searchTerm, bus }),
    {
      enabled: isQueryEnabled,
      keepPreviousData: true
    }
  );

  return {
    data,
    error,
    hasBusConfig,
    isError,
    isFetching,
    isLoading,
    refetch
  };
};

export const useBusServices = (areaId: AreaId) => {
  const bus = useBusSettings();
  const hasBusConfig = !!bus.uri && !!areaId;
  const busQueryConfigKey = getBusQueryConfigKey(bus);

  const { data, isFetching, isLoading, refetch } = useQuery<BusServiceListItem[]>(
    [BUS_QUERY_KEYS.ROOT, BUS_QUERY_KEYS.SERVICES, areaId, busQueryConfigKey],
    () => findPublicServices({ areaId, bus }),
    {
      enabled: hasBusConfig,
      keepPreviousData: true
    }
  );

  return {
    data: _sortBy(data ?? [], (item) => item.name?.toUpperCase()),
    isFetching,
    isLoading,
    refetch
  };
};

export const useBusInitialArea = (areaId: AreaId) => {
  const bus = useBusSettings();
  const hasBusConfig = !!bus?.uri && !!areaId;

  const { data, isFetching, isLoading, refetch } = useQuery<PoliticalArea | null, Error>(
    [BUS_QUERY_KEYS.ROOT, BUS_QUERY_KEYS.INITIAL_AREA, areaId],
    () => getPoliticalArea({ areaId, bus }),
    {
      enabled: hasBusConfig
    }
  );

  return {
    data,
    isFetching,
    isLoading,
    refetch
  };
};

export const useBusService = ({ areaId, id }: BusServiceArgs) => {
  const bus = useBusSettings();
  const hasBusConfig = !!bus.uri && !!areaId;
  const busQueryConfigKey = getBusQueryConfigKey(bus);

  const { data, isLoading, refetch } = useQuery<BusServiceDetail | undefined, Error>(
    [BUS_QUERY_KEYS.ROOT, BUS_QUERY_KEYS.SERVICE, areaId, id, busQueryConfigKey],
    () => getPublicService({ areaId, bus, id }),
    {
      enabled: hasBusConfig && !!id
    }
  );

  return {
    data,
    isLoading,
    refetch
  };
};

export const useBusTop10 = (services: BusServiceListItem[] = []) => {
  const {
    data: top10Ids = [],
    loading: top10IdsLoading,
    refetch: refetchTop10Ids
  } = useStaticContent<(string | number)[]>({
    name: 'bus-top10',
    parseFromJson: (json) => (Array.isArray(json) ? json : []),
    refreshTimeKey: 'publicJsonFile-bus-top10',
    type: 'json',
    skip: !services.length
  });

  const top10 = top10Ids
    .map((id) => services.find((service) => `${service.id}` === `${id}`))
    .filter((service): service is BusServiceListItem => !!service);

  return {
    data: top10,
    isLoading: top10IdsLoading,
    refetch: refetchTop10Ids
  };
};
