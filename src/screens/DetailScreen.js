import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { Query } from 'react-apollo';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';

import { auth } from '../auth';
import {
  EventRecord,
  LoadingContainer,
  NewsItem,
  Offer,
  PointOfInterest,
  SafeAreaViewFlex,
  Tour
} from '../components';
import { colors, consts } from '../config';
import { graphqlFetchPolicy } from '../helpers';
import { useRefreshTime } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';
import { GenericType } from '../types';

const getGenericComponent = (genericType) => {
  switch (genericType) {
    case GenericType.Commercial:
    case GenericType.Job:
      return Offer;
  }
};

const getComponent = (query, genericType) => {
  const COMPONENTS = {
    [QUERY_TYPES.NEWS_ITEM]: NewsItem,
    [QUERY_TYPES.EVENT_RECORD]: EventRecord,
    [QUERY_TYPES.GENERIC_ITEM]: getGenericComponent(genericType),
    [QUERY_TYPES.POINT_OF_INTEREST]: PointOfInterest,
    [QUERY_TYPES.TOUR]: Tour
  };

  return COMPONENTS[query];
};

const getRefreshInterval = (query) => {
  const REFRESH_INTERVALS = {
    [QUERY_TYPES.NEWS_ITEM]: consts.REFRESH_INTERVALS.NEWS,
    [QUERY_TYPES.EVENT_RECORD]: consts.REFRESH_INTERVALS.EVENTS,
    [QUERY_TYPES.POINT_OF_INTEREST]: consts.REFRESH_INTERVALS.POINTS_OF_INTEREST,
    [QUERY_TYPES.TOUR]: consts.REFRESH_INTERVALS.TOURS
  };

  return REFRESH_INTERVALS[query];
};

const useRootRouteByCategory = (details, navigation) => {
  const categoriesNews = useContext(SettingsContext)?.globalSettings?.sections?.categoriesNews;
  const id = details.categories?.[0]?.id;

  useEffect(() => {
    if (!id || !categoriesNews) {
      return;
    }

    // the types (may) differ, so == is required over ===
    const newRootRouteName = categoriesNews.find((category) => category.categoryId == id)
      ?.rootRouteName;

    if (newRootRouteName?.length) {
      navigation.setParams({ rootRouteName: newRootRouteName });
    }
  }, [details.categories?.[0]?.id, categoriesNews]);
};

export const DetailScreen = ({ navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const details = route.params?.details ?? {};

  const [refreshing, setRefreshing] = useState(false);

  if (!query || !queryVariables || !queryVariables.id) return null;

  const refreshTime = useRefreshTime(`${query}-${queryVariables.id}`, getRefreshInterval(query));

  useEffect(() => {
    isConnected && auth();
  }, []);

  useRootRouteByCategory(details, navigation);

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const refresh = async (refetch) => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });

  return (
    <Query query={getQuery(query)} variables={{ id: queryVariables.id }} fetchPolicy={fetchPolicy}>
      {({ data, loading, refetch }) => {
        if (loading) {
          return (
            <LoadingContainer>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          );
        }

        // we can have `data` from GraphQL or `details` from the previous list view.
        // if there is no cached `data` or network fetched `data` we fallback to the `details`.
        if ((!data || !data[query]) && !details) return null;

        const Component = getComponent(query, data?.[query]?.genericType ?? details?.genericType);

        if (!Component) return null;

        return (
          <SafeAreaViewFlex>
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => refresh(refetch)}
                  colors={[colors.accent]}
                  tintColor={colors.accent}
                />
              }
            >
              <Component
                data={(data && data[query]) || details}
                navigation={navigation}
                fetchPolicy={fetchPolicy}
                route={route}
              />
            </ScrollView>
          </SafeAreaViewFlex>
        );
      }}
    </Query>
  );
};

DetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
