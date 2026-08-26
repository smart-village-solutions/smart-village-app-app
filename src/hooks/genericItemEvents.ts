import { useMemo } from 'react';
import { useQueries } from 'react-query';

import { parseGenericItemEvents } from '../helpers/genericItemEventHelper';
import { getQuery } from '../queries';
import { QUERY_TYPES } from '../queries/types';
import { ReactQueryClient } from '../ReactQueryClient';
import { GenericItemEventListItem, GenericItemEventSource } from '../types';

type Options = {
  dateRange?: string[];
  enabled?: boolean;
  sources?: GenericItemEventSource[];
};

const EMPTY_DATA: GenericItemEventListItem[] = [];

export const useGenericItemEvents = ({ dateRange, enabled = true, sources = [] }: Options) => {
  const validSources = useMemo(
    () =>
      (Array.isArray(sources) ? sources : []).flatMap((source) => {
        const genericType = `${source?.genericType || ''}`.trim();
        return source && genericType ? [{ ...source, genericType }] : [];
      }),
    [sources]
  );
  const genericTypes = useMemo(
    () => Array.from(new Set(validSources.map(({ genericType }) => `${genericType}`))),
    [validSources]
  );
  const queryEnabled = enabled && genericTypes.length > 0;
  const queries = useQueries(
    genericTypes.map((genericType) => ({
      queryKey: [QUERY_TYPES.GENERIC_ITEMS, { genericType }],
      queryFn: async () => {
        const client = await ReactQueryClient();
        return client.request(getQuery(QUERY_TYPES.GENERIC_ITEMS), {
          genericType,
          limit: undefined
        });
      },
      enabled: queryEnabled
    }))
  );

  const data = useMemo(() => {
    if (!queryEnabled) return EMPTY_DATA;
    const merged = validSources.flatMap((source) => {
      const index = genericTypes.indexOf(`${source.genericType}`);
      const result = queries[index]?.data as Record<string, unknown[]> | undefined;
      return parseGenericItemEvents(result?.[QUERY_TYPES.GENERIC_ITEMS], source, dateRange);
    });
    return Array.from(new Map(merged.map((item) => [item.id, item])).values()).sort(
      (a, b) =>
        a.listDate.localeCompare(b.listDate) ||
        `${a.startTime || ''}`.localeCompare(`${b.startTime || ''}`) ||
        a.title.localeCompare(b.title)
    );
  }, [dateRange, genericTypes, queries, queryEnabled, validSources]);

  return {
    data,
    isLoading: queryEnabled && queries.some(({ isLoading }) => isLoading),
    isRefetching: queryEnabled && queries.some(({ isRefetching }) => isRefetching),
    refetch: async () =>
      queryEnabled ? Promise.all(queries.map(({ refetch }) => refetch())) : Promise.resolve([])
  };
};
