import { StackScreenProps } from '@react-navigation/stack';
import _uniqBy from 'lodash/uniqBy';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import { RefreshControl, StyleSheet } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import {
  BoldText,
  Button,
  DropdownHeader,
  EmptyMessage,
  ListComponent,
  LoadingSpinner,
  RegularText,
  Wrapper,
  WrapperVertical
} from '../../components';
import { colors, texts } from '../../config';
import { graphqlFetchPolicy, parseListItemsFromQuery } from '../../helpers';
import { useVoucher } from '../../hooks';
import { QUERY_TYPES, getFetchMoreQuery, getQuery } from '../../queries';
import { ScreenName } from '../../types';

const getAdditionalQueryVariables = (selectedValue: string) => {
  const additionalQueryVariables = {};

  if (selectedValue) {
    additionalQueryVariables['categoryId'] = selectedValue;
  }

  return additionalQueryVariables;
};

const hasFilterSelection = (queryVariables: any) => {
  return !!Object.prototype.hasOwnProperty.call(queryVariables, 'categoryId');
};

/* eslint-disable complexity */
export const VoucherIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { isLoggedIn, memberId } = useVoucher();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  const [refreshing, setRefreshing] = useState(false);
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables || {});

  const query = route.params?.query ?? '';
  const showFilter = route.params?.showFilter ?? true;

  const { data, loading, fetchMore, refetch } = useQuery(getQuery(query), {
    fetchPolicy,
    variables: { limit: 20, order: 'createdAt_ASC', memberId, ...queryVariables }
  });

  const { data: vouchersCategories } = useQuery(getQuery(QUERY_TYPES.VOUCHERS_CATEGORIES), {
    fetchPolicy,
    skip: query !== QUERY_TYPES.VOUCHERS || !showFilter
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

  const updateListDataByDropdown = useCallback(
    (selectedValue: string) => {
      if (selectedValue) {
        setQueryVariables((prevQueryVariables: any) => {
          // remove a refetch key if present, which was necessary for the "- Alle -" selection
          delete prevQueryVariables.refetch;

          return {
            ...prevQueryVariables,
            ...getAdditionalQueryVariables(selectedValue)
          };
        });
      } else {
        if (hasFilterSelection(queryVariables)) {
          setQueryVariables((prevQueryVariables: any) => {
            // remove the filter key for the specific query if present, when selecting "- Alle -"
            delete prevQueryVariables['categoryId'];

            return { ...prevQueryVariables, refetch: true };
          });
        }
      }
    },
    [query, queryVariables]
  );

  if (loading) {
    return <LoadingSpinner loading />;
  }

  const count = listItems?.length;

  return (
    <ListComponent
      navigation={navigation}
      query={query}
      queryVariables={queryVariables}
      data={listItems}
      fetchMoreData={fetchMoreData}
      // TODO: replace with dropdown filter component here
      ListHeaderComponent={
        <>
          {query === QUERY_TYPES.VOUCHERS && (
            <>
              {!!showFilter && (
                <DropdownHeader
                  {...{
                    data: vouchersCategories?.[QUERY_TYPES.GENERIC_ITEMS],
                    query,
                    queryVariables,
                    updateListData: updateListDataByDropdown
                  }}
                />
              )}

              {!isLoggedIn && (
                <Wrapper>
                  <WrapperVertical>
                    <BoldText>{texts.voucher.indexLoginTitle}</BoldText>
                  </WrapperVertical>

                  <WrapperVertical style={styles.noPaddingTop}>
                    <RegularText>{texts.voucher.indexLoginDescription}</RegularText>
                  </WrapperVertical>

                  <Button
                    title={texts.voucher.loginButton}
                    onPress={() => navigation.navigate(ScreenName.VoucherLogin)}
                  />
                </Wrapper>
              )}

              {count > 0 && showFilter && (
                <Wrapper style={styles.noPaddingTop}>
                  <BoldText>
                    {count} {count === 1 ? texts.voucher.result : texts.voucher.results}
                  </BoldText>
                </Wrapper>
              )}
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
/* eslint-enable complexity */

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
