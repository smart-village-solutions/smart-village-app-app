import _isEmpty from 'lodash/isEmpty';
import _isObjectLike from 'lodash/isObjectLike';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';

import appJson from '../../app.json';
import { graphqlFetchPolicy } from '../helpers';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';

import { useRefreshTime } from './TimeHooks';

type StaticContentArgs<T = unknown> = {
  name: string;
  refreshTimeKey?: string;
  refreshInterval?: string;
  fetchPolicy?: 'cache-first' | 'cache-only' | 'network-only';
  skip?: boolean;
} & (
  | {
      type: 'json';
      parseFromJson?: (json: unknown) => T;
    }
  | {
      type: 'html';
      parseFromJson?: undefined;
    }
);

/**
 * Gets static content by type and name. Automatically generates refresh interval, refresh time key and fetch policy if not provided.
 * @param options Options for the query.
 * @returns result error: if there is an error for the query or the parsing; loading: if the query is initializing or loading
 */
export const useStaticContent = <T>({
  fetchPolicy: overrideFetchPolicy,
  name,
  parseFromJson,
  refreshInterval,
  refreshTimeKey,
  skip,
  type
}: StaticContentArgs<T>): {
  data?: T;
  error: boolean;
  loading: boolean;
  refetch: () => Promise<unknown>;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [error, setError] = useState(false);

  const refreshTime = useRefreshTime(refreshTimeKey ?? name, refreshInterval);

  const fetchPolicy =
    overrideFetchPolicy ??
    graphqlFetchPolicy({
      isConnected,
      isMainserverUp,
      refreshTime
    });

  const {
    data,
    error: queryError,
    loading,
    refetch
  } = useQuery(
    getQuery(type === 'json' ? QUERY_TYPES.PUBLIC_JSON_FILE : QUERY_TYPES.PUBLIC_HTML_FILE),
    {
      variables: { name, version: appJson.expo.version },
      fetchPolicy,
      skip: !refreshTime || skip
    }
  );

  const refetchCallback = useCallback(async () => {
    return await refetch?.();
  }, [refetch]);

  const publicFileData = useMemo(() => {
    setError(false);

    if (type === 'html') {
      return data?.publicHtmlFile?.content;
    }

    try {
      const json = data?.publicJsonFile?.content;

      if (!_isEmpty(json) && _isObjectLike(json)) {
        return parseFromJson ? parseFromJson(json) : json;
      } else if (!loading && data) {
        // set error true if there is bad data without `publicJsonFile.content`
        setError(true);
      }
    } catch (error) {
      setError(true);
    }
  }, [data, parseFromJson]);

  return {
    data: publicFileData,
    error: error || !!queryError,
    // add the extra condition to avoid weird rendering states, where `loading` is false, but the
    // `publicFileData` is not yet set. this way we can safely manipulate `data` and then update the
    // `publicFileData` with it, after the query has finished loading.
    loading: loading || (publicFileData === undefined && !error && !queryError && !skip),
    refetch: refetchCallback
  };
};
