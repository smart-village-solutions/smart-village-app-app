import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { Query } from 'react-apollo';
import { useMatomo } from 'matomo-tracker-react-native';

import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';
import { auth } from '../auth';
import { colors, consts } from '../config';
import {
  DropdownHeader,
  HeaderLeft,
  ListComponent,
  LoadingContainer,
  LocationOverview,
  MapSwitchHeader,
  SafeAreaViewFlex
} from '../components';
import { getQuery, getFetchMoreQuery, QUERY_TYPES } from '../queries';
import { graphqlFetchPolicy, matomoTrackingString, parseListItemsFromQuery } from '../helpers';

const { MATOMO_TRACKING } = consts;

export const IndexScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { filter = {} } = globalSettings;
  const { news: showNewsFilter = false, events: showEventsFilter = true } = filter;
  const [queryVariables, setQueryVariables] = useState(navigation.getParam('queryVariables', {}));
  const [refreshing, setRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { trackScreenView } = useMatomo();

  const query = navigation.getParam('query', '');
  const title = navigation.getParam('title', '');
  const titleDetail = navigation.getParam('titleDetail', '');

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

  useEffect(() => {
    isConnected && auth();
  }, []);

  useEffect(() => {
    // we want to ensure when changing from one index screen to another, for example from
    // news to events, that the query variables are taken freshly. otherwise the mounted screen can
    // have query variables from the previous screen, that does not work. this can result in an
    // empty screen because the query is not retuning anything.
    setQueryVariables(navigation.getParam('queryVariables', {}));

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
        trackScreenView(matomoTrackingString([MATOMO_TRACKING_SCREEN, MATOMO_TRACKING_CATEGORY]));
    }
  }, [isConnected, navigation, query, setQueryVariables, trackScreenView]);

  if (!query) return null;

  const showFilter = {
    [QUERY_TYPES.EVENT_RECORDS]: showEventsFilter,
    [QUERY_TYPES.NEWS_ITEMS]: showNewsFilter
  }[query];
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
        <LocationOverview navigation={navigation} category={queryVariables.category} />
      ) : (
        <Query
          query={getQuery(query, { showNewsFilter, showEventsFilter })}
          variables={queryVariables}
          fetchPolicy={fetchPolicy}
        >
          {({ data, loading, fetchMore, refetch }) => {
            if (loading) {
              return (
                <LoadingContainer>
                  <ActivityIndicator color={colors.accent} />
                </LoadingContainer>
              );
            }

            const listItems = parseListItemsFromQuery(query, data, false, titleDetail);

            if (!listItems) return null;

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

IndexScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
