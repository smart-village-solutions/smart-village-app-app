/* eslint-disable complexity */
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import _filter from 'lodash/filter';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { useInfiniteQuery, useQuery } from 'react-query';

import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { NetworkContext } from '../../NetworkProvider';
import {
  EmptyMessage,
  Filter,
  INITIAL_START_DATE,
  ListComponent,
  MapAndListSwitcher,
  RegularText,
  SafeAreaViewFlex,
  Search,
  SueLoadingIndicator,
  WrapperVertical
} from '../../components';
import { colors, consts, normalize, texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { getQuery, QUERY_TYPES } from '../../queries';
import { StatusProps, SueViewType } from '../../types';

import { SueMapScreen } from './SueMapScreen';

const { FILTER_TYPES } = consts;

const limit = 20;

const SORT_BY = {
  REQUESTED_DATE_TIME: 'requested_datetime DESC',
  STATUS: 'status ASC',
  TITLE: 'title ASC',
  UPDATED_DATE_TIME: 'updated_datetime DESC'
};

const SORT_OPTIONS = [
  {
    value: texts.filter.sorting.requestedDatetime,
    selected: false,
    filterValue: SORT_BY.REQUESTED_DATE_TIME,
    index: 1,
    id: 1
  },
  {
    value: texts.filter.sorting.updatedDatetime,
    selected: false,
    filterValue: SORT_BY.UPDATED_DATE_TIME,
    index: 2,
    id: 2
  },
  {
    value: texts.filter.sorting.title,
    selected: false,
    filterValue: SORT_BY.TITLE,
    index: 3,
    id: 3
  },
  {
    value: texts.filter.sorting.status,
    selected: false,
    filterValue: SORT_BY.STATUS,
    index: 4,
    id: 4
  }
];

type Props = {
  navigation: StackNavigationProp<Record<string, any>>;
  route: RouteProp<any, never>;
};

export const SueListScreen = ({ navigation, route }: Props) => {
  const { isConnected } = useContext(NetworkContext);
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { sueStatus = {}, sueListItem = {} } = appDesignSystem;
  const { statuses }: { statuses: StatusProps[] } = sueStatus;
  const { showViewSwitcherButton = false } = sueListItem;
  const query = route.params?.query ?? QUERY_TYPES.SUE.REQUESTS;

  const initialQueryVariables = route.params?.queryVariables ?? {
    limit,
    offset: 0,
    start_date: INITIAL_START_DATE
  };
  const [queryVariables, setQueryVariables] = useState(initialQueryVariables);
  const [dataCountQueryVariables, setDataCountQueryVariables] = useState({
    start_date: INITIAL_START_DATE
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isOpening, setIsOpening] = useState(true);
  const [viewType, setViewType] = useState(route.params?.viewType || SueViewType.List);

  // Separate search from the rest so it does not become part of the React Query
  // cache key or get sent to the API (which does not support server-side search).
  // Filtering is done client-side over all loaded pages.
  const { search: searchTerm, ...queryVariablesWithoutSearch } = queryVariables;

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      [
        query,
        {
          ...queryVariablesWithoutSearch,
          sort_attribute: queryVariablesWithoutSearch.sortBy || SORT_BY.REQUESTED_DATE_TIME
        }
      ],
      ({ pageParam = 0 }) =>
        getQuery(query)({
          ...queryVariablesWithoutSearch,
          sort_attribute: queryVariablesWithoutSearch.sortBy || SORT_BY.REQUESTED_DATE_TIME,
          offset: pageParam
        }),
      {
        getNextPageParam: (lastPage, allPages) => {
          if (lastPage.length < limit) {
            return undefined;
          }

          return allPages.length * limit;
        },
        cacheTime: moment().endOf('day').diff(moment(), 'milliseconds')
      }
    );

  const { data: servicesData } = useQuery([QUERY_TYPES.SUE.SERVICES], () =>
    getQuery(QUERY_TYPES.SUE.SERVICES)()
  );

  const { data: dataCount } = useQuery(
    [QUERY_TYPES.SUE.LOCATION, { dataCountQueryVariables }],
    () => getQuery(QUERY_TYPES.SUE.LOCATION)(dataCountQueryVariables),
    {
      enabled: query !== QUERY_TYPES.SUE.MY_REQUESTS
    }
  );

  const services = useMemo(() => {
    if (!servicesData?.length) return;

    return servicesData.map((item: any, index: number) => ({
      filterValue: item.serviceCode,
      id: index + 1,
      index: index + 1,
      selected: false,
      value: item.serviceName
    }));
  }, [servicesData]);

  // there is some peformance issue with rendering the screen so we return null first
  useEffect(() => {
    setTimeout(() => {
      setIsOpening(false);
    }, 50);
  }, []);

  useEffect(() => {
    const { limit, offset, search, ...rest } = queryVariables;

    setDataCountQueryVariables(rest);
  }, [queryVariables]);

  // When a search term is active, automatically load all remaining pages so that
  // client-side filtering covers the full data set, not just the already-loaded pages.
  // Guard against a retry loop: stop auto-fetching when offline or after a fetch error.
  // Auto-fetching resumes once the search term or filters change (which resets isError).
  useEffect(() => {
    if (searchTerm && hasNextPage && !isFetchingNextPage && isConnected && !isError) {
      fetchNextPage();
    }
  }, [searchTerm, hasNextPage, isFetchingNextPage, isConnected, isError, fetchNextPage]);

  const listItems = useMemo(() => {
    if (!data?.pages?.length) return [];

    let parsedListItem = parseListItemsFromQuery(
      query,
      data.pages.flatMap((page) => page),
      undefined,
      {
        appDesignSystem
      }
    );

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();

      parsedListItem = _filter(
        parsedListItem,
        (item) =>
          item.title?.toLowerCase().includes(lowerSearch) ||
          item.description?.toLowerCase().includes(lowerSearch) ||
          item.address?.toLowerCase().includes(lowerSearch)
      );
    }

    return parsedListItem;
  }, [appDesignSystem, data, query, searchTerm]);

  const displayCount = useMemo(() => {
    return searchTerm || query === QUERY_TYPES.SUE.MY_REQUESTS
      ? listItems.length
      : dataCount?.length;
  }, [searchTerm, query, listItems.length, dataCount?.length]);

  const refresh = async () => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  const fetchMoreData = useCallback(async () => {
    if (hasNextPage) {
      return await fetchNextPage();
    }

    return {};
  }, [data, fetchNextPage, hasNextPage, query]);

  if (isOpening) return null;

  return (
    <SafeAreaViewFlex>
      {viewType === SueViewType.Map ? (
        <SueMapScreen
          navigation={navigation}
          route={route}
          setViewType={setViewType}
          viewType={viewType}
        />
      ) : (
        <ListComponent
          navigation={navigation}
          query={query}
          data={listItems}
          fetchMoreData={fetchMoreData}
          ListEmptyComponent={
            isLoading ? <SueLoadingIndicator /> : <EmptyMessage title={texts.sue.empty.list} />
          }
          ListHeaderComponent={
            <>
              <WrapperVertical>
                <Search
                  setQueryVariables={setQueryVariables}
                  placeholder={texts.sue.filter.search}
                />
              </WrapperVertical>

              {query !== QUERY_TYPES.SUE.MY_REQUESTS && (
                <>
                  <WrapperVertical>
                    {!!showViewSwitcherButton && (
                      <MapAndListSwitcher viewType={viewType} setViewType={setViewType} />
                    )}
                    <Filter
                      filterTypes={[
                        {
                          type: FILTER_TYPES.DATE,
                          name: 'date',
                          data: [
                            {
                              hasFutureDates: false,
                              hasPastDates: true,
                              name: 'start_date',
                              placeholder: texts.sue.filter.createdBy
                            },
                            {
                              hasFutureDates: false,
                              hasPastDates: true,
                              name: 'end_date',
                              placeholder: texts.sue.filter.createdUntil
                            }
                          ]
                        },
                        {
                          type: FILTER_TYPES.DROPDOWN,
                          label: texts.sue.filter.selectCategory,
                          name: 'service_code',
                          data: services,
                          placeholder: texts.sue.filter.allCategories
                        },
                        {
                          type: FILTER_TYPES.SUE.STATUS,
                          label: texts.sue.filter.status,
                          name: 'status',
                          data: statuses
                        },
                        {
                          type: FILTER_TYPES.DROPDOWN,
                          label: texts.sue.filter.sortBy,
                          name: 'sortBy',
                          data: SORT_OPTIONS,
                          placeholder: texts.sue.filter.allSortingTypes
                        }
                      ]}
                      queryVariables={initialQueryVariables}
                      setQueryVariables={setQueryVariables}
                      withSearch
                    />
                  </WrapperVertical>

                  <WrapperVertical>
                    <Divider />
                  </WrapperVertical>
                </>
              )}

              {displayCount != null && (
                <View style={styles.countRow}>
                  <RegularText small>
                    {displayCount} {displayCount === 1 ? texts.filter.result : texts.filter.results}
                  </RegularText>
                  {/* Show a spinner next to the count while we are still auto-fetching
                      all pages to cover the full data set for client-side search. */}
                  {!!searchTerm && (hasNextPage || isFetchingNextPage) && (
                    <ActivityIndicator
                      color={colors.refreshControl}
                      size="small"
                      style={styles.countSpinner}
                    />
                  )}
                </View>
              )}
            </>
          }
          ListFooterLoadingIndicator={SueLoadingIndicator}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
        />
      )}
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  countRow: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  countSpinner: {
    marginLeft: normalize(8)
  }
});
