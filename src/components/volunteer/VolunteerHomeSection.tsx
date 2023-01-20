import { StackNavigationProp } from '@react-navigation/stack';
import _isNumber from 'lodash/isNumber';
import React, { useState } from 'react';

import { isUpcomingDate } from '../../helpers';
import { useVolunteerData, useVolunteerRefresh } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { VolunteerQuery } from '../../types';
import { Calendar } from '../Calendar';
import { CalendarListToggle } from '../CalendarListToggle';
import { DataListSection } from '../DataListSection';
import { SectionHeader } from '../SectionHeader';

type Props = {
  buttonTitle?: string;
  isRandom?: boolean;
  limit?: number;
  linkTitle?: string;
  navigate?: () => void;
  navigateButton?: () => void;
  navigateLink?: () => void;
  navigation: StackNavigationProp<any>;
  placeholder?: React.ReactElement;
  query: VolunteerQuery;
  queryVariables?: { dateRange?: string[]; contentContainerId?: number };
  sectionTitle?: string;
  sectionTitleDetail?: string;
  showButton?: boolean;
  showLink?: boolean;
};

// eslint-disable-next-line complexity
export const VolunteerHomeSection = ({
  buttonTitle,
  isRandom,
  limit,
  linkTitle,
  navigate,
  navigateButton,
  navigateLink,
  navigation,
  placeholder,
  query,
  queryVariables,
  sectionTitle,
  sectionTitleDetail,
  showButton = true,
  showLink = false
}: Props) => {
  const isCalendar =
    query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL || query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY;
  const [showCalendar, setShowCalendar] = useState(isCalendar);
  const {
    data: sectionData,
    isLoading,
    refetch
  } = useVolunteerData({
    query,
    queryVariables,
    isCalendar,
    isSectioned: false,
    onlyUpcoming: !showCalendar
  });

  useVolunteerRefresh(
    refetch,
    // if we have a calendar query and there is a `contentContainerId` number in `queryVariables`,
    // we are on the group detail screen and need to pass the group query identifier to
    // ensure correct behavior of the refresh event
    isCalendar && queryVariables?.contentContainerId && _isNumber(queryVariables.contentContainerId)
      ? QUERY_TYPES.VOLUNTEER.GROUP
      : query
  );

  if (isCalendar) {
    const showAllLink = sectionData?.some((item: { listDate: string }) =>
      isUpcomingDate(item.listDate)
    );

    return (
      <>
        {!!sectionTitle && (
          <SectionHeader
            onPress={sectionData?.length ? navigate : undefined}
            title={sectionTitle}
          />
        )}
        <CalendarListToggle showCalendar={showCalendar} setShowCalendar={setShowCalendar} />
        {showCalendar ? (
          <Calendar
            query={query}
            queryVariables={queryVariables}
            calendarData={sectionData}
            isLoading={isLoading}
            navigation={navigation}
          />
        ) : (
          <DataListSection
            navigateLink={navigateLink}
            navigation={navigation}
            query={query}
            sectionData={sectionData}
            sectionTitle=""
          />
        )}
        <DataListSection
          loading={isLoading}
          buttonTitle={buttonTitle}
          linkTitle={linkTitle}
          limit={0}
          navigate={navigate}
          navigation={navigation}
          query={query}
          sectionData={sectionData}
          sectionTitle=""
          showButton={showButton}
          showLink={showAllLink}
          navigateButton={navigateButton}
          navigateLink={navigateLink}
        />
      </>
    );
  }

  return (
    <DataListSection
      loading={isLoading}
      buttonTitle={buttonTitle}
      linkTitle={linkTitle}
      limit={limit}
      navigate={navigate}
      navigation={navigation}
      placeholder={placeholder}
      query={query}
      sectionData={sectionData}
      sectionTitle={sectionTitle}
      sectionTitleDetail={sectionTitleDetail}
      showButton={showButton}
      showLink={showLink && !!sectionData?.length}
      navigateButton={navigateButton}
      navigateLink={navigateLink}
      isRandom={isRandom}
    />
  );
};
