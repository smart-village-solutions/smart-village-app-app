import { StackScreenProps } from '@react-navigation/stack';
import _uniqBy from 'lodash/uniqBy';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import { RefreshControl } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import {
  EmptyMessage,
  ListComponent,
  LoadingSpinner,
  RegularText,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { graphqlFetchPolicy, parseListItemsFromQuery } from '../../helpers';
import { QUERY_TYPES, getFetchMoreQuery, getQuery } from '../../queries';

export const VoucherIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  const [refreshing, setRefreshing] = useState(false);

  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const showFilter = route.params?.showFilter ?? true;

  const { data, loading, fetchMore, refetch } = useQuery(getQuery(query), {
    fetchPolicy,
    variables: queryVariables
  });

  const listItems = useMemo(() => {
    return parseListItemsFromQuery(query, data, undefined, {
      withDate: false
    });
  }, [data, query]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetch();
    }
    setRefreshing(false);
  }, [isConnected, refetch, setRefreshing]);

  const fetchMoreData = () => {
    return fetchMore({
      query: getFetchMoreQuery(query),
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult?.[query]?.length) return prevResult;

        const uniqueData = _uniqBy([...prevResult[query], ...fetchMoreResult[query]], 'id');

        return {
          ...prevResult,
          [query]: uniqueData
        };
      }
    });
  };

  if (loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <ListComponent
      navigation={navigation}
      query={query}
      queryVariables={queryVariables}
      data={listItems}
      fetchMoreData={fetchMoreData}
      // TODO: replace with dropdown filter & login component here
      ListHeaderComponent={
        <>
          {query === QUERY_TYPES.VOUCHERS && (
            <>
              {!!showFilter && (
                <Wrapper>
                  <RegularText>Add dropdown Filter Here</RegularText>
                </Wrapper>
              )}

              <Wrapper>
                <RegularText>Add login component here</RegularText>
              </Wrapper>
            </>
          )}
        </>
      }
      ListEmptyComponent={
        loading ? (
          <LoadingSpinner loading={loading} />
        ) : (
          <EmptyMessage title={texts.empty.list} showIcon />
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
      showBackToTop
    />
  );
};
