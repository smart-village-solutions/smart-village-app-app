import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';
import { auth } from '../auth';
import { colors, consts, texts } from '../config';
import {
  CategoryList,
  DropdownHeader,
  IndexFilterWrapperAndList,
  ListComponent,
  EmptyMessage,
  LoadingContainer,
  LocationOverview,
  OptionToggle,
  SafeAreaViewFlex
} from '../components';
import { getQuery, getFetchMoreQuery, QUERY_TYPES } from '../queries';
import {
  graphqlFetchPolicy,
  isOpen,
  matomoTrackingString,
  parseListItemsFromQuery,
  sortPOIsByDistanceFromPosition
} from '../helpers';
import { usePermanentFilter, usePosition, useTrackScreenViewAsync } from '../hooks';

const { MATOMO_TRACKING } = consts;

const TOP_FILTER = {
  LIST: 'list',
  MAP: 'map'
};

const INITIAL_TOP_FILTER = [
  { id: TOP_FILTER.LIST, title: texts.locationOverview.list, selected: true },
  { id: TOP_FILTER.MAP, title: texts.locationOverview.map, selected: false }
];

const isMapSelected = (query, topFilter) =>
  query === QUERY_TYPES.POINTS_OF_INTEREST &&
  topFilter.find((entry) => entry.selected).id === TOP_FILTER.MAP;

const keyForSelectedValueByQuery = {
  [QUERY_TYPES.EVENT_RECORDS]: 'categoryId',
  [QUERY_TYPES.NEWS_ITEMS]: 'dataProvider'
};
const getAdditionalQueryVariables = (query, selectedValue, excludeDataProviderIds) => {
  const keyForSelectedValue = keyForSelectedValueByQuery[query];
  const additionalQueryVariables = {};

  if (query === QUERY_TYPES.NEWS_ITEMS) {
    additionalQueryVariables.excludeDataProviderIds = excludeDataProviderIds;
  }

  if (selectedValue) {
    additionalQueryVariables[keyForSelectedValue] = selectedValue;
  }

  return additionalQueryVariables;
};

// TODO: make a list component for POIs that already includes the mapswitchheader?
// TODO: make a list component that already includes the news/events filter?
// eslint-disable-next-line complexity
export const IndexScreen = ({ navigation, route }) => {
  const [topFilter, setTopFilter] = useState(INITIAL_TOP_FILTER);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { filter = {} } = globalSettings;
  const { news: showNewsFilter = false, events: showEventsFilter = true } = filter;
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables ?? {});
  const [refreshing, setRefreshing] = useState(false);
  const trackScreenViewAsync = useTrackScreenViewAsync();
  const [filterByOpeningTimes, setFilterByOpeningTimes] = useState(false);
  const { state: excludeDataProviderIds } = usePermanentFilter();

  const query = route.params?.query ?? '';

  const showMap = isMapSelected(query, topFilter);

  // we currently only require the position for POIs
  const sortByDistance = query === QUERY_TYPES.POINTS_OF_INTEREST;

  const { loading: loadingPosition, position } = usePosition(!sortByDistance);

  const title = route.params?.title ?? '';
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
  const categories = route.params?.categories;
  const showFilter =
    (route.params?.showFilter ?? true) &&
    {
      [QUERY_TYPES.EVENT_RECORDS]: showEventsFilter,
      [QUERY_TYPES.NEWS_ITEMS]: showNewsFilter
    }[query];

  const refresh = useCallback(
    async (refetch) => {
      setRefreshing(true);
      isConnected && (await refetch());
      setRefreshing(false);
    },
    [isConnected, setRefreshing]
  );

  const updateListData = useCallback(
    (selectedValue) => {
      const additionalQueryVariables = getAdditionalQueryVariables(
        query,
        selectedValue,
        excludeDataProviderIds
      );

      if (selectedValue) {
        // remove a refetch key if present, which was necessary for the "- Alle -" selection
        delete queryVariables.refetch;

        setQueryVariables({ ...queryVariables, ...additionalQueryVariables });
      } else {
        setQueryVariables((prevQueryVariables) => {
          // remove the filter key for the specific query, when selecting "- Alle -"
          delete prevQueryVariables[keyForSelectedValueByQuery[query]];
          // need to spread the `prevQueryVariables` into a new object with additional refetch key
          // to force the Query component to update the data, otherwise it is not fired somehow
          // because the state variable wouldn't change
          return { ...prevQueryVariables, refetch: true };
        });
      }
    },
    [excludeDataProviderIds, setQueryVariables, query, queryVariables]
  );

  // if we show the map or want to sort by distance, we need to fetch all the entries at once
  // this is not a big issue if we want to sort by distance, because getting the location usually takes longer than fetching all entries
  // if we filter by opening times, we need to also remove the limit as otherwise we might not have any open POIs in the next batch
  // that would result in the list not getting any new items and not reliably triggering another fetchMore
  if (showMap || sortByDistance || filterByOpeningTimes) {
    delete queryVariables.limit;
  }

  useEffect(() => {
    isConnected && auth();
  }, []);

  useEffect(() => {
    // we want to ensure when changing from one index screen to another, for example from
    // news to events, that the query variables are taken freshly. otherwise the mounted screen can
    // have query variables from the previous screen, that does not work. this can result in an
    // empty screen because the query is not retuning anything.
    const variables = {
      ...(route.params?.queryVariables ?? {}),
      ...getAdditionalQueryVariables(query, undefined, excludeDataProviderIds)
    };

    setQueryVariables(variables);
  }, [excludeDataProviderIds, query, route.params?.queryVariables]);

  useEffect(() => {
    if (query) {
      const MATOMO_TRACKING_SCREEN = {
        [QUERY_TYPES.EVENT_RECORDS]: MATOMO_TRACKING.SCREEN_VIEW.EVENT_RECORDS,
        [QUERY_TYPES.GENERIC_ITEMS]: MATOMO_TRACKING.SCREEN_VIEW.GENERIC_ITEMS,
        [QUERY_TYPES.NEWS_ITEMS]: MATOMO_TRACKING.SCREEN_VIEW.NEWS_ITEMS,
        [QUERY_TYPES.POINTS_OF_INTEREST]: MATOMO_TRACKING.SCREEN_VIEW.POINTS_OF_INTEREST,
        [QUERY_TYPES.TOURS]: MATOMO_TRACKING.SCREEN_VIEW.TOURS,
        [QUERY_TYPES.CATEGORIES]: MATOMO_TRACKING.SCREEN_VIEW.POINTS_OF_INTEREST_AND_TOURS
      }[query];

      // in some cases we want to apply more information to the tracking string
      const MATOMO_TRACKING_CATEGORY = {
        [QUERY_TYPES.EVENT_RECORDS]: null,
        [QUERY_TYPES.GENERIC_ITEMS]: title, // the title should be the type of the generic items
        [QUERY_TYPES.NEWS_ITEMS]: title, // the title should be the category of news
        [QUERY_TYPES.POINTS_OF_INTEREST]: null,
        [QUERY_TYPES.TOURS]: null,
        [QUERY_TYPES.CATEGORIES]: null
      }[query];

      // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `query`
      //       dependency
      isConnected &&
        trackScreenViewAsync(
          matomoTrackingString([MATOMO_TRACKING_SCREEN, MATOMO_TRACKING_CATEGORY])
        );
    }
  }, [isConnected, query]);

  if (!query) return null;

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  return (
    <SafeAreaViewFlex>
      {query === QUERY_TYPES.POINTS_OF_INTEREST ? (
        <View>
          <IndexFilterWrapperAndList filter={topFilter} setFilter={setTopFilter} />
          <OptionToggle
            label={texts.pointOfInterest.filterByOpeningTime}
            onToggle={() => setFilterByOpeningTimes((value) => !value)}
            value={filterByOpeningTimes}
          />

          <Divider />
        </View>
      ) : null}
      {query === QUERY_TYPES.POINTS_OF_INTEREST && showMap ? (
        <LocationOverview
          filterByOpeningTimes={filterByOpeningTimes}
          navigation={navigation}
          route={route}
          position={position}
          queryVariables={{
            ...queryVariables,
            limit: undefined
          }}
        />
      ) : (
        <Query
          query={getQuery(query, { showNewsFilter, showEventsFilter })}
          variables={queryVariables}
          fetchPolicy={fetchPolicy}
        >
          {({ data, loading, fetchMore, refetch }) => {
            if (loading || loadingPosition) {
              return (
                <LoadingContainer>
                  <ActivityIndicator color={colors.accent} />
                </LoadingContainer>
              );
            }

            let listItems = parseListItemsFromQuery(query, data, titleDetail, {
              bookmarkable,
              withDate: false,
              queryVariables
            });

            if (filterByOpeningTimes) {
              listItems = listItems?.filter(
                (entry) => isOpen(entry.params?.details?.openingHours)?.open
              );
            }

            if (sortByDistance && position && listItems?.length) {
              listItems = sortPOIsByDistanceFromPosition(listItems, position.coords);
            }

            const fetchMoreData = () =>
              fetchMore({
                query: getFetchMoreQuery(query),
                variables: {
                  ...queryVariables,
                  offset: data?.[query]?.length
                },
                updateQuery: (prevResult, { fetchMoreResult }) => {
                  if (!fetchMoreResult || !fetchMoreResult[query].length) return prevResult;

                  return {
                    ...prevResult,
                    [query]: [...prevResult[query], ...fetchMoreResult[query]]
                  };
                }
              });

            return (
              <ListComponent
                ListHeaderComponent={
                  <>
                    {!!showFilter && (
                      <DropdownHeader {...{ query, queryVariables, data, updateListData }} />
                    )}
                    {!!categories?.length && (
                      <CategoryList
                        navigation={navigation}
                        data={categories}
                        horizontal={false}
                        hasSectionHeader={false}
                      />
                    )}
                  </>
                }
                ListEmptyComponent={
                  <EmptyMessage
                    title={categories?.length ? texts.empty.categoryList : texts.empty.list}
                  />
                }
                navigation={navigation}
                data={listItems}
                horizontal={false}
                sectionByDate={true}
                query={query}
                fetchMoreData={isConnected ? fetchMoreData : null}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => refresh(refetch)}
                    colors={[colors.accent]}
                    tintColor={colors.accent}
                  />
                }
                showBackToTop
              />
            );
          }}
        </Query>
      )}
    </SafeAreaViewFlex>
  );
};

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
