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
  Wrapper,
  WrapperVertical
} from '../../components';
import { colors, consts, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { buildProfileContentSections } from '../../helpers/profileContentHelper';
import { NetworkContext } from '../../NetworkProvider';
import { useProfileContext } from '../../ProfileProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { ProfileMember, ScreenName } from '../../types';

const { LIST_TYPES, ROOT_ROUTE_NAMES } = consts;
const PAGE_LIMIT = 100;

type ProfileMemberWithDataProvider = ProfileMember & {
  data_provider_id?: string | number;
};

const getSectionNavigationParams = (
  sectionKey: string,
  title: string,
  dataProviderId?: string | number
) => {
  switch (sectionKey) {
    case 'eventRecords':
      return {
        title,
        query: QUERY_TYPES.EVENT_RECORDS,
        queryVariables: {
          dataProviderId,
          limit: PAGE_LIMIT,
          order: 'listDate_ASC'
        },
        rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS
      };
    case 'pointsOfInterest':
      return {
        title,
        query: QUERY_TYPES.POINTS_OF_INTEREST,
        queryVariables: {
          dataProviderId,
          limit: PAGE_LIMIT,
          order: 'updatedAt_DESC'
        },
        rootRouteName: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS
      };
    default:
      return {
        title,
        query: QUERY_TYPES.NEWS_ITEMS,
        queryVariables: {
          dataProviderId,
          limit: PAGE_LIMIT,
          order: 'updatedAt_DESC'
        },
        rootRouteName: ROOT_ROUTE_NAMES.NEWS_ITEMS
      };
  }
};

export const ProfileContentScreen = ({
  navigation
}: StackScreenProps<Record<string, object | undefined>>) => {
  const { currentUserData, refresh } = useProfileContext();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const profileData = currentUserData as ProfileMemberWithDataProvider | null;
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
    fetchPolicy,
    skip: !dataProviderId,
    variables: queryVariables
  });

  const {
    data: pointsOfInterestData,
    loading: loadingPointsOfInterest,
    refetch: refetchPointsOfInterest
  } = useQuery(getQuery(QUERY_TYPES.POINTS_OF_INTEREST), {
    fetchPolicy,
    skip: !dataProviderId,
    variables: queryVariables
  });

  const {
    data: eventRecordsData,
    loading: loadingEventRecords,
    refetch: refetchEventRecords
  } = useQuery(getQuery(QUERY_TYPES.EVENT_RECORDS), {
    fetchPolicy,
    skip: !dataProviderId,
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

      if (!dataProviderId) return;

      await Promise.all([refetchNews?.(), refetchPointsOfInterest?.(), refetchEventRecords?.()]);
    },
    [
      dataProviderId,
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
    return (
      <Wrapper>
        <EmptyMessage title={texts.profile.myContentEmpty} />
      </Wrapper>
    );
  }

  if (!sections.length) {
    return (
      <Wrapper>
        <EmptyMessage title={texts.profile.myContentEmpty} />
      </Wrapper>
    );
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
