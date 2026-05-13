import _sortBy from 'lodash/sortBy';
import { useContext } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';

import {
  DEFAULT_LIST_LIMIT,
  findBusCategoryChildren,
  findBusCategoryRoot,
  findPublicServicesPage,
  getPoliticalArea,
  getPublicService,
  searchPoliticalAreas
} from '../queries/bus';
import { SettingsContext } from '../SettingsProvider';
import type {
  AreaId,
  BusAreaSearchResult,
  BusCategory,
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
  CATEGORY_CHILDREN: 'category-children',
  LIFE_SITUATIONS_ROOT: 'life-situations-root',
  ROOT: 'bus',
  SERVICE: 'service',
  SERVICE_SEARCH: 'service-search',
  SERVICES: 'services',
  INITIAL_AREA: 'initial-area',
  TOP10: 'top10'
} as const;

export const DEFAULT_BUS_LIFE_SITUATIONS_ROOT_SEARCH_WORD =
  'Lebenslagen für Bürgerinnen und Bürger';
export const BUS_MIN_SEARCH_LENGTH = 3;
export const BUS_SEARCH_DEBOUNCE_MS = 400;
const BUS_QUERY_RETRY_COUNT = 0;

const flattenServicePages = (pages?: { items?: BusServiceListItem[] }[]) =>
  _sortBy(
    (pages ?? []).flatMap((page) => page?.items ?? []),
    (item) => item.name?.toUpperCase()
  );

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

export const getBusLifeSituationsRootSearchWord = (bus?: BusSettings) => {
  const trimmedSearchWord = bus?.lifeSituationsRootSearchWord?.trim();

  return trimmedSearchWord || DEFAULT_BUS_LIFE_SITUATIONS_ROOT_SEARCH_WORD;
};

const useBusSettings = (): BusSettings => {
  const { globalSettings } = useContext(SettingsContext) as BusSettingsContextValue;
  return globalSettings?.settings?.bus ?? {};
};

export const useBusAreas = (searchTerm: string = '', isEnabled: boolean = true) => {
  const bus = useBusSettings();
  const hasBusConfig = !!bus.uri;
  const busQueryConfigKey = getBusQueryConfigKey(bus);
  const isQueryEnabled =
    isEnabled && hasBusConfig && searchTerm.trim().length >= BUS_MIN_SEARCH_LENGTH;

  const { data, error, isError, isFetching, isLoading, refetch } = useQuery<
    BusAreaSearchResult[],
    Error
  >(
    [BUS_QUERY_KEYS.ROOT, BUS_QUERY_KEYS.AREAS, searchTerm, busQueryConfigKey],
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

export const useBusLifeSituationsRoot = (areaId?: AreaId) => {
  const bus = useBusSettings();
  const hasBusConfig = !!bus.uri && !!areaId;
  const busQueryConfigKey = getBusQueryConfigKey(bus);
  const searchWord = getBusLifeSituationsRootSearchWord(bus);

  const { data, error, isError, isFetching, isLoading, refetch } = useQuery<BusCategory | null>(
    [
      BUS_QUERY_KEYS.ROOT,
      BUS_QUERY_KEYS.LIFE_SITUATIONS_ROOT,
      areaId,
      searchWord,
      busQueryConfigKey
    ],
    () => findBusCategoryRoot({ areaId, bus, searchWord }),
    {
      enabled: hasBusConfig
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

export const useBusCategoryChildren = (parentId?: string | number | null, areaId?: AreaId) => {
  const bus = useBusSettings();
  const hasValidParentId =
    parentId !== null && parentId !== undefined && `${parentId}`.trim().length > 0;
  const hasBusConfig = !!bus.uri && !!areaId && hasValidParentId;
  const busQueryConfigKey = getBusQueryConfigKey(bus);

  const { data, error, isError, isFetching, isLoading, refetch } = useQuery<BusCategory[], Error>(
    [BUS_QUERY_KEYS.ROOT, BUS_QUERY_KEYS.CATEGORY_CHILDREN, parentId, areaId, busQueryConfigKey],
    () => findBusCategoryChildren({ areaId, bus, parentId }),
    {
      enabled: hasBusConfig
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

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery(
    [BUS_QUERY_KEYS.ROOT, BUS_QUERY_KEYS.SERVICES, areaId, busQueryConfigKey],
    ({ pageParam = 0 }) =>
      findPublicServicesPage({
        areaId,
        bus,
        limit: DEFAULT_LIST_LIMIT,
        offset: pageParam
      }),
    {
      enabled: hasBusConfig,
      retry: BUS_QUERY_RETRY_COUNT,
      getNextPageParam: (lastPage, pages) => {
        const loadedItemsCount = pages.reduce(
          (count, page) => count + (page?.items?.length ?? 0),
          0
        );

        return loadedItemsCount < lastPage.totalItemCount ? loadedItemsCount : undefined;
      }
    }
  );

  return {
    data: flattenServicePages(data?.pages),
    error,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch
  };
};

export const useBusServiceSearch = (areaId: AreaId, searchTerm: string = '') => {
  const bus = useBusSettings();
  const trimmedSearchTerm = searchTerm.trim();
  const hasBusConfig = !!bus.uri && !!areaId;
  const isQueryEnabled = hasBusConfig && trimmedSearchTerm.length >= BUS_MIN_SEARCH_LENGTH;
  const busQueryConfigKey = getBusQueryConfigKey(bus);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery(
    [
      BUS_QUERY_KEYS.ROOT,
      BUS_QUERY_KEYS.SERVICE_SEARCH,
      areaId,
      trimmedSearchTerm,
      busQueryConfigKey
    ],
    ({ pageParam = 0 }) =>
      findPublicServicesPage({
        areaId,
        bus,
        limit: DEFAULT_LIST_LIMIT,
        offset: pageParam,
        searchWord: trimmedSearchTerm
      }),
    {
      enabled: isQueryEnabled,
      retry: BUS_QUERY_RETRY_COUNT,
      getNextPageParam: (lastPage, pages) => {
        const loadedItemsCount = pages.reduce(
          (count, page) => count + (page?.items?.length ?? 0),
          0
        );

        return loadedItemsCount < lastPage.totalItemCount ? loadedItemsCount : undefined;
      }
    }
  );

  return {
    data: flattenServicePages(data?.pages),
    error,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
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
