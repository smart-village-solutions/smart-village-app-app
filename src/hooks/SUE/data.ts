import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import { sueParser } from '../../helpers';
import { getQuery } from '../../queries';

/* eslint-disable complexity */
export const useSueData = ({
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
  const [sueData, setSueData] = useState<any[]>([]);

  const processSueData = useCallback(async () => {
    let processedSueData = data as any[];

    processedSueData = sueParser(query, data);

    setIsProcessing(true);

    setSueData(processedSueData);
    setIsProcessing(false);
  }, [query, queryVariables, data, refetch]);

  useEffect(() => {
    processSueData();
  }, [processSueData]);

  return { data: sueData, isLoading: isLoading || isProcessing, isRefetching, refetch };
};
/* eslint-enable complexity */
