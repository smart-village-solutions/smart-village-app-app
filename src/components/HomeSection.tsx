import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { useQuery } from 'react-query';

import { useHomeRefresh, useVolunteerData } from '../hooks';
import { getQuery, QUERY_TYPES } from '../queries';
import { ReactQueryClient } from '../ReactQueryClient';

import { DataListSection } from './DataListSection';

type Props = {
  buttonTitle: string;
  fetchPolicy:
    | 'cache-first'
    | 'network-only'
    | 'cache-only'
    | 'no-cache'
    | 'standby'
    | 'cache-and-network';
  isIndexStartingAt1: boolean;
  navigate: () => void;
  navigation: StackNavigationProp<any>;
  placeholder?: React.ReactElement;
  query: string;
  queryVariables: { limit?: number; take?: number };
  showVolunteerEvents?: boolean;
  title: string;
  titleDetail?: string;
};

export const HomeSection = ({
  buttonTitle,
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
  const { data, isLoading, refetch } = useQuery([query, queryVariables], async () => {
    const client = await ReactQueryClient();

    return await client.request(getQuery(query), queryVariables);
  });

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

  useHomeRefresh(() => {
    refetch();
    isCalendarWithVolunteerEvents && refetchVolunteerEvents();
  });

  let showButton = !!data?.[query]?.length;

  if (query === QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS) {
    showButton =
      !!data?.[QUERY_TYPES.POINTS_OF_INTEREST]?.length || !!data?.[QUERY_TYPES.TOURS]?.length;
  }

  const loading = isLoading || isLoadingVolunteerEvents;
  const additionalData = isCalendarWithVolunteerEvents ? dataVolunteerEvents : undefined;

  return (
    <DataListSection
      additionalData={additionalData}
      buttonTitle={buttonTitle}
      isIndexStartingAt1={isIndexStartingAt1}
      limit={queryVariables?.limit || queryVariables?.take}
      loading={loading}
      navigate={navigate}
      navigateButton={navigate}
      navigation={navigation}
      placeholder={placeholder}
      query={query}
      sectionData={data}
      sectionTitle={title}
      sectionTitleDetail={titleDetail}
      showButton={showButton}
    />
  );
};
