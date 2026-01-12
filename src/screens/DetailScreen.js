import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, RefreshControl, ScrollView } from 'react-native';
import { useQuery } from 'react-query';

import {
  EmptyMessage,
  EventRecord,
  LoadingContainer,
  NewsItem,
  NoticeboardDetail,
  Offer,
  PointOfInterest,
  SafeAreaViewFlex,
  Tour
} from '../components';
import { FeedbackFooter } from '../components/FeedbackFooter';
import { colors, consts, texts } from '../config';
import { graphqlFetchPolicy } from '../helpers';
import { useRefreshTime } from '../hooks';
import { DETAIL_REFRESH_EVENT } from '../hooks/DetailRefresh';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { ReactQueryClient } from '../ReactQueryClient';
import { SettingsContext } from '../SettingsProvider';
import { GenericType } from '../types';

import { DefectReportFormScreen } from './DefectReport';
import { NoticeboardFormScreen } from './Noticeboard';
import { SueDetailScreen } from './SUE';

const getGenericComponent = (genericType) => {
  switch (genericType) {
    case GenericType.Commercial:
    case GenericType.Deadline:
    case GenericType.Job:
      return Offer;
    case GenericType.Noticeboard:
      return NoticeboardDetail;
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
  const categoriesNews = useContext(SettingsContext).globalSettings?.sections?.categoriesNews;
  const id = details.categories?.[0]?.id;

  useEffect(() => {
    if (!id || !categoriesNews) {
      return;
    }

    // the types (may) differ, so == is required over ===
    const rootRouteNameByCategory = categoriesNews.find(
      (category) => category.categoryId == id
    )?.rootRouteName;

    if (rootRouteNameByCategory?.length) {
      navigation.setParams({ rootRouteName: rootRouteNameByCategory });
    }
  }, [id, categoriesNews]);
};

/* eslint-disable complexity */
export const DetailScreen = ({ navigation, route }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { conversations = false } = settings;
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const query = route.params?.query ?? '';
  const id = route.params?.id;
  const queryVariables = route.params?.queryVariables || (id ? { id } : {});
  const details = route.params?.details ?? {};

  const [refreshing, setRefreshing] = useState(false);

  if (!query || !queryVariables || !queryVariables.id) return null;

  const refreshTime = useRefreshTime(`${query}-${queryVariables.id}`, getRefreshInterval(query));

  useRootRouteByCategory(details, navigation);

  // Render SUE detail screen without the need of processing the rest of the code here
  if (
    query === QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID ||
    query === QUERY_TYPES.SUE.MY_REQUEST_WITH_SERVICE_REQUEST_ID
  ) {
    return <SueDetailScreen navigation={navigation} route={route} />;
  }

  const refresh = async (refetch) => {
    setRefreshing(true);

    // this will trigger the onRefresh functions provided to the `useDetailRefresh` hook in other
    // components.
    DeviceEventEmitter.emit(DETAIL_REFRESH_EVENT);

    isConnected && (await refetch());
    setRefreshing(false);
  };

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });

  const {
    data,
    isLoading: loading,
    isRefetching,
    refetch
  } = useQuery(
    [query, { id: queryVariables.id }, refreshTime],
    async () => {
      const client = await ReactQueryClient();
      return await client.request(getQuery(query), { id: queryVariables.id });
    },
    {
      enabled: !!refreshTime
    }
  );

  if (!refreshTime) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  if (loading && !isRefetching) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  // we can have `data` from GraphQL or `details` from the previous list view.
  // if there is no cached `data` or network fetched `data` we fallback to the `details`.
  if ((!data || !data[query]) && !details) {
    return <EmptyMessage title={texts.empty.content} />;
  }

  let Component;

  // check for special generic item cases first
  const genericType = data?.[query]?.genericType || details?.genericType;
  if (genericType === GenericType.DefectReport) {
    Component = DefectReportFormScreen;
  }
  if (genericType === GenericType.Noticeboard && !conversations) {
    Component = NoticeboardFormScreen;
  }

  if (Component) {
    return (
      <Component
        data={(data && data[query]) || details}
        navigation={navigation}
        fetchPolicy={fetchPolicy}
        refetch={refetch}
        route={route}
      />
    );
  }

  // otherwise determine detail screen based on query and generic type
  Component = getComponent(query, genericType);

  if (!Component) return null;

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refresh(refetch)}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        <Component
          data={(data && data[query]) || details}
          navigation={navigation}
          fetchPolicy={fetchPolicy}
          refetch={refetch}
          route={route}
        />
        <FeedbackFooter />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

DetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
