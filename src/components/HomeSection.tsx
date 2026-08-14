import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { useQuery } from 'react-query';

import { useHomePointsOfInterestAndToursRefresh, useHomeRefresh, useVolunteerData } from '../hooks';
import { getQuery, QUERY_TYPES } from '../queries';
import { ReactQueryClient } from '../ReactQueryClient';

import { DataListSection } from './DataListSection';

type Props = {
  buttonTitle: string;
  dateTimeFormat?: string;
  fetchPolicy:
    | 'cache-first'
    | 'network-only'
    | 'cache-only'
    | 'no-cache'
    | 'standby'
    | 'cache-and-network';
  isIndexStartingAt1: boolean;
  navigate: () => void;
  navigation: StackNavigationProp<Record<string, object | undefined>>;
  placeholder?: React.ReactElement;
  query: string;
  queryVariables: { limit?: number; take?: number };
  showVolunteerEvents?: boolean;
  title: string;
  titleDetail?: string;
};

export const HomeSection = ({
  buttonTitle,
  dateTimeFormat,
  isIndexStartingAt1 = false,
  navigate,
  navigation,
  placeholder,
  query,
  queryVariables,
  showVolunteerEvents = false,
  title,
  titleDetail
}: Props) => {
  const isPointsOfInterestAndTours = query === QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS;
  // `dataUpdatedAt` is provided by react-query and changes whenever a successful fetch updates data.
  const { data, dataUpdatedAt, isLoading, refetch } = useQuery(
    [query, queryVariables],
    async () => {
      const client = await ReactQueryClient();

      return await client.request(getQuery(query), queryVariables);
    },
    isPointsOfInterestAndTours
      ? {
          // Keep one random selection stable across tab switches; manual refresh uses a separate event.
          staleTime: 60 * 60 * 1000,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false
        }
      : undefined
  );

  const isCalendarWithVolunteerEvents = query === QUERY_TYPES.EVENT_RECORDS && showVolunteerEvents;

  const {
    data: dataVolunteerEvents,
    isLoading: isLoadingVolunteerEvents = false,
    refetch: refetchVolunteerEvents
  } = useVolunteerData({
    query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
    queryOptions: { enabled: isCalendarWithVolunteerEvents },
    isCalendar: isCalendarWithVolunteerEvents,
    isSectioned: false
  });

  useHomeRefresh(
    isPointsOfInterestAndTours
      ? undefined
      : () => {
          refetch();
          isCalendarWithVolunteerEvents && refetchVolunteerEvents();
        }
  );

  useHomePointsOfInterestAndToursRefresh(
    isPointsOfInterestAndTours
      ? () => {
          // Pull-to-refresh must always fetch a new random result, even inside the cache window.
          refetch();
        }
      : undefined
  );

  let showButton = !!data?.[query]?.length;

  if (isPointsOfInterestAndTours) {
    showButton =
      !!data?.[QUERY_TYPES.POINTS_OF_INTEREST]?.length || !!data?.[QUERY_TYPES.TOURS]?.length;
  }

  const loading = isLoading || isLoadingVolunteerEvents;
  const additionalData = isCalendarWithVolunteerEvents ? dataVolunteerEvents : undefined;

  return (
    <DataListSection
      additionalData={additionalData}
      buttonTitle={buttonTitle}
      dateTimeFormat={dateTimeFormat}
      isIndexStartingAt1={isIndexStartingAt1}
      limit={queryVariables?.limit || queryVariables?.take}
      loading={loading}
      navigate={navigate}
      navigateButton={navigate}
      navigation={navigation}
      placeholder={placeholder}
      query={query}
      queryUpdatedAt={dataUpdatedAt}
      sectionData={data}
      sectionTitle={title}
      sectionTitleDetail={titleDetail}
      showButton={showButton}
    />
  );
};
