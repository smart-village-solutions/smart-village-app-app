/* eslint-disable complexity */
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import _filter from 'lodash/filter';
import moment from 'moment';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from 'react';
import { RefreshControl, TouchableOpacity } from 'react-native';
import { useInfiniteQuery, useQuery } from 'react-query';

import { StyleSheet } from 'react-native';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { NetworkContext } from '../../NetworkProvider';
import {
  BoldText,
  EmptyMessage,
  Filter,
  HeaderLeft,
  ListComponent,
  RegularText,
  SafeAreaViewFlex,
  Search,
  SueLoadingIndicator,
  Wrapper,
  WrapperHorizontal,
  WrapperVertical
} from '../../components';
import { colors, consts, Icon, normalize, texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { getQuery, QUERY_TYPES } from '../../queries';
import { StatusProps } from '../../types';
import { SueMapScreen } from './SueMapScreen';

const { a11yLabel, FILTER_TYPES } = consts;

const limit = 20;
const initial_start_date = { start_date: '1900-01-01T00:00:00+01:00' };

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

const VIEW_TYPE = {
  LIST: 'list',
  MAP: 'map'
};

export const SueListScreen = ({ navigation, route }: Props) => {
  const { isConnected } = useContext(NetworkContext);
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { sueStatus = {}, sueListItem = {} } = appDesignSystem;
  const { statuses }: { statuses: StatusProps[] } = sueStatus;
  const { showViewSwitcherButton = false } = sueListItem;
  const query = route.params?.query ?? '';

  const initialQueryVariables = route.params?.queryVariables ?? {
    limit,
    offset: 0,
    ...initial_start_date
  };
  const [queryVariables, setQueryVariables] = useState(initialQueryVariables);
  const [dataCountQueryVariables, setDataCountQueryVariables] = useState(() => {
    const { limit, offset, ...rest } = queryVariables;

    return { ...rest, ...initial_start_date };
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isOpening, setIsOpening] = useState(true);
  const [viewType, setViewType] = useState(VIEW_TYPE.LIST);

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

  useEffect(() => {
    const { limit, offset, search, ...rest } = queryVariables;

    setDataCountQueryVariables(rest);
  }, [queryVariables]);

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

  useLayoutEffect(() => {
    if (viewType === VIEW_TYPE.MAP) {
      navigation.setOptions({
        headerTitle: texts.screenTitles.sue.mapView,
        headerLeft: () => (
          <HeaderLeft
            onPress={() => setViewType(VIEW_TYPE.LIST)}
            backImage={({ tintColor }) => (
              <Icon.Close
                color={tintColor}
                size={normalize(22)}
                style={{ paddingHorizontal: normalize(14) }}
              />
            )}
          />
        )
      });
    } else {
      navigation.setOptions({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      });
    }
  }, [query, viewType]);

  if (isOpening) return null;

  return (
    <SafeAreaViewFlex>
      {viewType === VIEW_TYPE.MAP ? (
        <>
          <SueMapScreen navigation={navigation} route={route} />
        </>
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
                <Search setQueryVariables={setQueryVariables} placeholder={texts.filter.search} />
              </WrapperVertical>

              <WrapperVertical>
                {!!showViewSwitcherButton && (
                  <TouchableOpacity
                    onPress={() => setViewType(VIEW_TYPE.MAP)}
                    accessibilityLabel={`${
                      viewType === VIEW_TYPE.LIST ? texts.sue.showMapView : texts.sue.showListView
                    } ${a11yLabel.button}`}
                    style={styles.button}
                  >
                    <BoldText small>
                      {viewType === VIEW_TYPE.LIST ? texts.sue.showMapView : texts.sue.showListView}
                    </BoldText>

                    {viewType === VIEW_TYPE.LIST ? (
                      <Icon.Map size={normalize(16)} style={styles.icon} color={colors.darkText} />
                    ) : (
                      <Icon.List size={normalize(14)} style={styles.icon} color={colors.darkText} />
                    )}
                  </TouchableOpacity>
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
                      placeholder: texts.sue.filter.alleSortingTypes
                    }
                  ]}
                  initialStartDate={initial_start_date.start_date}
                  queryVariables={initialQueryVariables}
                  setQueryVariables={setQueryVariables}
                  withSearch
                />
              </WrapperVertical>

              {!!dataCount?.length && (
                <RegularText small>
                  {dataCount.length} {dataCount.length === 1 ? texts.sue.result : texts.sue.results}
                </RegularText>
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
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    paddingTop: normalize(16),
    position: 'absolute'
  },
  icon: {
    paddingLeft: normalize(8)
  }
});
