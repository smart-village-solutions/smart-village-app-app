import { StackNavigationProp } from '@react-navigation/stack';
import _isNumber from 'lodash/isNumber';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { normalize } from 'react-native-elements';

import { colors, Icon, texts } from '../../config';
import { isUpcomingDate } from '../../helpers';
import { useVolunteerData, useVolunteerRefresh } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { VolunteerQuery } from '../../types';
import { DataListSection } from '../DataListSection';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { WrapperRow } from '../Wrapper';

import { VolunteerCalendar } from './VolunteerCalendar';

type CalendarListToggle = {
  showCalendar: boolean;
  setShowCalendar: (showCalendar: boolean) => void;
};

const CalendarListToggle = ({ showCalendar, setShowCalendar }: CalendarListToggle) => {
  const text = showCalendar ? ` ${texts.volunteer.list}` : ` ${texts.volunteer.calendar}`;
  const CalendarListToggleIcon = showCalendar ? Icon.VolunteerList : Icon.VolunteerCalendar;

  return (
    <Touchable onPress={() => setShowCalendar(!showCalendar)}>
      <WrapperRow style={styles.calendarListToggle}>
        <CalendarListToggleIcon color={colors.darkText} />
        <RegularText>{text}</RegularText>
      </WrapperRow>
    </Touchable>
  );
};

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
  queryVariables?: { dateRange?: string[] } | number;
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
    // if we have a calendar query and there is a number as queryVariables, we are on the group
    // detail screen and need to pass the group query identifier to ensure correct behavior of
    // the refresh event
    isCalendar && queryVariables && _isNumber(queryVariables) ? QUERY_TYPES.VOLUNTEER.GROUP : query
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
          <VolunteerCalendar
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

const styles = StyleSheet.create({
  calendarListToggle: {
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5)
  }
});
