import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';
import { auth } from '../auth';
import { colors, consts } from '../config';
import {
  DropdownHeader,
  ListComponent,
  LoadingContainer,
  LocationOverview,
  MapSwitchHeader,
  SafeAreaViewFlex
} from '../components';
import { getQuery, getFetchMoreQuery, QUERY_TYPES } from '../queries';
import {
  graphqlFetchPolicy,
  matomoTrackingString,
  parseListItemsFromQuery,
  sortPOIsByDistanceFromPosition
} from '../helpers';
import { usePosition, useTrackScreenViewAsync } from '../hooks';

const { MATOMO_TRACKING } = consts;

// TODO: make a list component for POIs that already includes the mapswitchheader?
// TODO: make a list component that already includes the news/events filter?
// eslint-disable-next-line complexity
export const IndexScreen = ({ navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { filter = {} } = globalSettings;
  const { news: showNewsFilter = false, events: showEventsFilter = true } = filter;
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables ?? {});
  const [refreshing, setRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const trackScreenViewAsync = useTrackScreenViewAsync();

  const query = route.params?.query ?? '';

  // we currently only require the position for POIs
  const sortByDistance = query === QUERY_TYPES.POINTS_OF_INTEREST;

  const { loading: loadingPosition, position } = usePosition(!sortByDistance);

  const title = route.params?.title ?? '';
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
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
      if (selectedValue) {
        // remove a refetch key if present, which was necessary for the "- Alle -" selection
        delete queryVariables.refetch;

        setQueryVariables({
          ...queryVariables,
          [queryVariableForQuery]: selectedValue
        });
      } else {
        setQueryVariables((prevQueryVariables) => {
          // remove the filter key for the specific query, when selecting "- Alle -"
          delete prevQueryVariables[queryVariableForQuery];
          // need to spread the `prevQueryVariables` into a new object with additional refetch key
          // to force the Query component to update the data, otherwise it is not fired somehow
          // because the state variable wouldn't change
          return { ...prevQueryVariables, refetch: true };
        });
      }
    },
    [setQueryVariables, queryVariables]
  );

  // if we show the map or want to sort by distance, we need to fetch all the entries at once
  // this is not a big issue if we want to sort by distance, because getting the location usually takes longer than fetching all entries
  if (showMap || sortByDistance) {
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
    setQueryVariables(route.params?.queryVariables ?? {});
  }, [query, route.params?.queryVariables]);

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

  const queryVariableForQuery = {
    [QUERY_TYPES.EVENT_RECORDS]: 'categoryId',
    [QUERY_TYPES.NEWS_ITEMS]: 'dataProvider'
  }[query];

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  return (
    <SafeAreaViewFlex>
      {query === QUERY_TYPES.POINTS_OF_INTEREST ? (
        <MapSwitchHeader setShowMap={setShowMap} showMap={showMap} />
      ) : null}
      {query === QUERY_TYPES.POINTS_OF_INTEREST && showMap ? (
        <LocationOverview
          navigation={navigation}
          route={route}
          position={position}
          category={queryVariables.category}
          dataProviderName={queryVariables.dataProvider}
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

            let listItems = parseListItemsFromQuery(query, data, false, titleDetail, bookmarkable);

            if (!listItems) return null;

            if (sortByDistance && position) {
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
                  showFilter ? (
                    <DropdownHeader {...{ query, queryVariables, data, updateListData }} />
                  ) : null
                }
                navigation={navigation}
                data={listItems}
                horizontal={false}
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
