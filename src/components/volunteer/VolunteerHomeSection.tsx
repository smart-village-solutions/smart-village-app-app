import { StackNavigationProp } from '@react-navigation/stack';
import _isNumber from 'lodash/isNumber';
import React, { useContext, useState } from 'react';
import { View } from 'react-native';

import { SettingsContext } from '../../SettingsProvider';
import { normalize } from '../../config';
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
  queryVariables: {
    contentContainerId?: number;
    dateRange?: string[];
    limit: number;
    page: number;
  };
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
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { calendarToggle = false } = settings;
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
        {calendarToggle && (
          <View style={{ marginHorizontal: normalize(6) }}>
            <CalendarListToggle showCalendar={showCalendar} setShowCalendar={setShowCalendar} />
          </View>
        )}
        {showCalendar ? (
          <Calendar
            additionalData={sectionData}
            isListRefreshing={isLoading}
            navigation={navigation}
            query={query}
            queryVariables={queryVariables}
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
          buttonTitle={buttonTitle}
          limit={0}
          linkTitle={linkTitle}
          loading={isLoading}
          navigate={navigate}
          navigateButton={navigateButton}
          navigateLink={navigateLink}
          navigation={navigation}
          query={query}
          sectionData={sectionData}
          sectionTitle=""
          showButton={showButton}
          showLink={showAllLink}
        />
      </>
    );
  }

  return (
    <DataListSection
      buttonTitle={buttonTitle}
      isRandom={isRandom}
      limit={limit}
      linkTitle={linkTitle}
      loading={isLoading}
      navigate={navigate}
      navigateButton={navigateButton}
      navigateLink={navigateLink}
      navigation={navigation}
      placeholder={placeholder}
      query={query}
      sectionData={sectionData}
      sectionTitle={sectionTitle}
      sectionTitleDetail={sectionTitleDetail}
      showButton={showButton}
      showLink={showLink && !!sectionData?.length}
    />
  );
};
