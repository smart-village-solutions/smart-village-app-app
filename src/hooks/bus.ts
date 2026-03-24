import _sortBy from 'lodash/sortBy';
import { useContext } from 'react';
import { useQuery } from 'react-query';

import { findPublicServices, getPublicService } from '../queries/bus';
import { SettingsContext } from '../SettingsProvider';

import { useStaticContent } from './staticContent';

const BUS_QUERY_KEYS = {
  AREAS: 'areas',
  ROOT: 'bus',
  SERVICE: 'service',
  SERVICES: 'services',
  TOP10: 'top10'
} as const;

type AreaId = string | number | undefined | null;

type BusSettings = {
  apiKey?: string;
  areaId?: string | number;
  initialFilter?: string[];
  uri?: string;
};

type BusService = {
  externalId?: string | number;
  id?: string | number;
  name?: string | null;
  teaser?: string | null;
};

type SettingsValue = {
  globalSettings?: {
    settings?: {
      bus?: BusSettings;
    };
  };
};

type BusArea = {
  areaId: string;
  selected: true;
  value: string;
};

type BusServiceArgs = {
  areaId?: AreaId;
  id?: string | number | null;
};

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
  const { globalSettings } = useContext(SettingsContext) as SettingsValue;
  return globalSettings?.settings?.bus ?? {};
};

// TODO: query political areas
export const useBusAreas = (areaId: AreaId) => {
  const normalizedAreaId = `${areaId}`;

  return {
    data: [
      {
        areaId: normalizedAreaId,
        selected: true,
        value: normalizedAreaId
      }
    ] satisfies BusArea[],
    isLoading: false as const,
    queryKey: [BUS_QUERY_KEYS.ROOT, BUS_QUERY_KEYS.AREAS, areaId] as const
  };
};

export const useBusServices = (areaId: AreaId) => {
  const bus = useBusSettings();
  const hasBusConfig = !!bus.uri && !!areaId;
  const busQueryConfigKey = getBusQueryConfigKey(bus);

  const { data, isLoading, refetch } = useQuery<BusService[]>(
    [BUS_QUERY_KEYS.ROOT, BUS_QUERY_KEYS.SERVICES, areaId, busQueryConfigKey],
    () => findPublicServices({ areaId, bus }),
    {
      enabled: hasBusConfig
    }
  );

  return {
    data: _sortBy(data ?? [], (item) => item.name?.toUpperCase()),
    isLoading,
    refetch
  };
};

export const useBusService = ({ areaId, id }: BusServiceArgs) => {
  const bus = useBusSettings();
  const hasBusConfig = !!bus.uri && !!areaId;
  const busQueryConfigKey = getBusQueryConfigKey(bus);

  const { data, isLoading, refetch } = useQuery<BusService | undefined>(
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

export const useBusTop10 = (services: BusService[] = []) => {
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
    .filter((service): service is BusService => !!service);

  return {
    data: top10,
    isLoading: top10IdsLoading,
    refetch: refetchTop10Ids
  };
};
