/* eslint-disable complexity */
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import _filter from 'lodash/filter';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useInfiniteQuery, useQuery } from 'react-query';

import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { NetworkContext } from '../../NetworkProvider';
import {
  EmptyMessage,
  Filter,
  ListComponent,
  RegularText,
  SafeAreaViewFlex,
  Search,
  StatusProps,
  SueLoadingIndicator,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { colors, consts, texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { QUERY_TYPES, getQuery } from '../../queries';

const { FILTER_TYPES } = consts;

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
  const { sueStatus = {} } = appDesignSystem;
  const { statuses }: { statuses: StatusProps[] } = sueStatus;
  const query = route.params?.query ?? '';

  const limit = 20;
  const initial_start_date = '1900-01-01T00:00:00+01:00';
  const dataCountQueryVariables = {
    start_date: initial_start_date
  };
  const initialQueryVariables = route.params?.queryVariables ?? {
    initial_start_date,
    limit,
    offset: 0
  };
  const [queryVariables, setQueryVariables] = useState(initialQueryVariables);
  const [refreshing, setRefreshing] = useState(false);
  const [isOpening, setIsOpening] = useState(true);

  const { data, isLoading, refetch, fetchNextPage, hasNextPage } = useInfiniteQuery(
    [
      query,
      {
        ...queryVariables,
        sort_attribute: queryVariables.sortBy || SORT_BY.REQUESTED_DATE_TIME
      }
    ],
    ({ pageParam = 0 }) =>
      getQuery(query)({
        ...queryVariables,
        sort_attribute: queryVariables.sortBy || SORT_BY.REQUESTED_DATE_TIME,
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
    () => getQuery(QUERY_TYPES.SUE.LOCATION)(dataCountQueryVariables)
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

    if (queryVariables.search) {
      parsedListItem = _filter(
        parsedListItem,
        (item) =>
          item.title?.toLowerCase().includes(queryVariables.search.toLowerCase()) ||
          item.description?.toLowerCase().includes(queryVariables.search.toLowerCase())
      );
    }

    return parsedListItem;
  }, [data, query, queryVariables]);

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
            <Wrapper>
              <Search setQueryVariables={setQueryVariables} placeholder={texts.filter.search} />
            </Wrapper>

            <Wrapper>
              <Filter
                filterTypes={[
                  {
                    type: FILTER_TYPES.DATE,
                    name: 'date',
                    data: [
                      { name: 'start_date', placeholder: 'Erstellt von' },
                      { name: 'end_date', placeholder: 'Erstellt bis' }
                    ]
                  },
                  {
                    type: FILTER_TYPES.DROPDOWN,
                    label: 'Kategorie auswählen',
                    name: 'service_code',
                    data: services,
                    placeholder: 'Alle Kategorien'
                  },
                  {
                    type: FILTER_TYPES.SUE.STATUS,
                    label: 'Status',
                    name: 'status',
                    data: statuses
                  },
                  {
                    type: FILTER_TYPES.DROPDOWN,
                    label: 'Sortieren nach',
                    name: 'sortBy',
                    data: SORT_OPTIONS,
                    placeholder: 'Alle Sortierarten'
                  }
                ]}
                initialFilters={initialQueryVariables}
                setQueryVariables={setQueryVariables}
              />
            </Wrapper>

            {!!dataCount?.length && (
              <WrapperHorizontal>
                <RegularText small>
                  {dataCount.length} {dataCount.length === 1 ? texts.sue.result : texts.sue.results}
                </RegularText>
              </WrapperHorizontal>
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
    </SafeAreaViewFlex>
  );
};
