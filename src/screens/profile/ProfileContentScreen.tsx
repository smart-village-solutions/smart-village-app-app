import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useQuery } from 'react-apollo';

import {
  EmptyMessage,
  ListComponent,
  LoadingContainer,
  SafeAreaViewFlex,
  SectionHeader,
  WrapperVertical
} from '../../components';
import { colors, consts, texts } from '../../config';
import { AUTH_MODE_USER, getApolloAuthContext } from '../../graphqlAuth';
import { graphqlFetchPolicy } from '../../helpers';
import { buildProfileContentSections } from '../../helpers/profileContentHelper';
import { hasEditorialRoles } from '../../helpers/profileEditorialContentHelper';
import { NetworkContext } from '../../NetworkProvider';
import { useProfileContext } from '../../ProfileProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { ProfileMember, ScreenName } from '../../types';

const { LIST_TYPES, ROOT_ROUTE_NAMES } = consts;
const PAGE_LIMIT = 100;

const PROFILE_CONTENT_NAVIGATION_CONFIG = {
  eventRecords: {
    query: QUERY_TYPES.EVENT_RECORDS,
    rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS,
    order: 'listDate_ASC',
    hideVolunteerEvents: true
  },
  pointsOfInterest: {
    query: QUERY_TYPES.POINTS_OF_INTEREST,
    rootRouteName: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS,
    order: 'updatedAt_DESC'
  },
  newsItems: {
    query: QUERY_TYPES.NEWS_ITEMS,
    rootRouteName: ROOT_ROUTE_NAMES.NEWS_ITEMS,
    order: 'updatedAt_DESC',
    skipResourceFilters: true
  }
} as const;

type ProfileMemberWithDataProvider = ProfileMember & {
  data_provider_id?: string | number;
};

const getSectionNavigationParams = (
  sectionKey: string,
  title: string,
  dataProviderId?: string | number
) => {
  const config =
    PROFILE_CONTENT_NAVIGATION_CONFIG[sectionKey] ?? PROFILE_CONTENT_NAVIGATION_CONFIG.newsItems;

  return {
    authMode: AUTH_MODE_USER,
    hideInvisible: true,
    title,
    query: config.query,
    queryVariables: {
      dataProviderId,
      limit: PAGE_LIMIT,
      order: config.order
    },
    rootRouteName: config.rootRouteName,
    hideVolunteerEvents: config.hideVolunteerEvents,
    skipResourceFilters: config.skipResourceFilters
  };
};

export const ProfileContentScreen = ({
  navigation
}: StackScreenProps<Record<string, object | undefined>>) => {
  const { currentUserData, refresh } = useProfileContext();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const emptyTitle = texts.noticeboard.emptyTitle;
  const profileData = currentUserData as ProfileMemberWithDataProvider | null;
  const hasEditorialAccess = hasEditorialRoles(profileData?.roles);
  const dataProviderId = profileData?.user?.data_provider_id || profileData?.data_provider_id;
  const queryVariables = {
    dataProviderId,
    limit: PAGE_LIMIT,
    order: 'updatedAt_DESC'
  };

  const {
    data: newsData,
    loading: loadingNews,
    refetch: refetchNews
  } = useQuery(getQuery(QUERY_TYPES.NEWS_ITEMS), {
    ...getApolloAuthContext(AUTH_MODE_USER),
    fetchPolicy,
    skip: !dataProviderId || !hasEditorialAccess,
    variables: queryVariables
  });

  const {
    data: pointsOfInterestData,
    loading: loadingPointsOfInterest,
    refetch: refetchPointsOfInterest
  } = useQuery(getQuery(QUERY_TYPES.POINTS_OF_INTEREST), {
    ...getApolloAuthContext(AUTH_MODE_USER),
    fetchPolicy,
    skip: !dataProviderId || !hasEditorialAccess,
    variables: queryVariables
  });

  const {
    data: eventRecordsData,
    loading: loadingEventRecords,
    refetch: refetchEventRecords
  } = useQuery(getQuery(QUERY_TYPES.EVENT_RECORDS), {
    ...getApolloAuthContext(AUTH_MODE_USER),
    fetchPolicy,
    skip: !dataProviderId || !hasEditorialAccess,
    variables: {
      ...queryVariables,
      onlyUniqEvents: true
    }
  });

  const sections = useMemo(
    () =>
      buildProfileContentSections({
        eventRecords: eventRecordsData?.eventRecords,
        newsItems: newsData?.newsItems,
        pointsOfInterest: pointsOfInterestData?.pointsOfInterest
      }),
    [eventRecordsData, newsData, pointsOfInterestData]
  );

  const refetchContent = useCallback(
    async ({ refreshProfile = false } = {}) => {
      if (!isConnected) return;

      if (refreshProfile || !dataProviderId) {
        await refresh();
      }

      if (!dataProviderId || !hasEditorialAccess) return;

      await Promise.all([refetchNews?.(), refetchPointsOfInterest?.(), refetchEventRecords?.()]);
    },
    [
      dataProviderId,
      hasEditorialAccess,
      isConnected,
      refetchEventRecords,
      refetchNews,
      refetchPointsOfInterest,
      refresh
    ]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchContent({ refreshProfile: true });
    setRefreshing(false);
  }, [refetchContent]);

  useFocusEffect(
    useCallback(() => {
      refetchContent();
    }, [refetchContent])
  );

  const isLoading = loadingNews || loadingPointsOfInterest || loadingEventRecords;

  if (isLoading && !sections.length) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  if (!dataProviderId) {
    return <EmptyMessage title={emptyTitle} />;
  }

  if (!hasEditorialAccess) {
    return <EmptyMessage title={emptyTitle} />;
  }

  if (!sections.length) {
    return <EmptyMessage title={emptyTitle} />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        {sections.map((item) => (
          <WrapperVertical key={item.key}>
            <SectionHeader
              onPress={() =>
                navigation.navigate(
                  ScreenName.Index,
                  getSectionNavigationParams(item.key, item.title, dataProviderId)
                )
              }
              title={item.title}
            />
            <ListComponent
              data={item.data}
              isLoading={isLoading}
              listType={LIST_TYPES.TEXT_LIST}
              navigation={navigation}
              query={item.query}
            />
          </WrapperVertical>
        ))}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
