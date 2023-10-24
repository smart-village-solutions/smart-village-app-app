import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import { parseListItemsFromQuery } from '../../helpers';
import { getQuery } from '../../queries';

/* eslint-disable complexity */
export const useSUEData = ({
  query,
  queryVariables,
  queryOptions
}: {
  query: string;
  queryVariables?: any;
  queryOptions?: { enabled?: boolean };
}): {
  data: any[];
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => void;
} => {
  const { data, isLoading, isRefetching, refetch } = useQuery(
    [query, queryVariables],
    () => getQuery(query)(queryVariables),
    queryOptions
  );

  const [isProcessing, setIsProcessing] = useState(true);
  const [sueData, setSUEData] = useState<any[]>([]);

  const processUSEData = useCallback(async () => {
    let processedUSEData = data as any[];

    processedUSEData = parseListItemsFromQuery(query, processedUSEData, undefined, {
      queryVariables
    });
    setIsProcessing(true);

    setSUEData(processedUSEData);
    setIsProcessing(false);
  }, [query, queryVariables, data, refetch]);

  useEffect(() => {
    processUSEData();
  }, [processUSEData]);

  return { data: sueData, isLoading: isLoading || isProcessing, isRefetching, refetch };
};
/* eslint-enable complexity */
