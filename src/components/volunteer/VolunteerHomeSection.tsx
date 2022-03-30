import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { normalize } from 'react-native-elements';

import { colors, Icon, texts } from '../../config';
import { isUpcomingDate } from '../../helpers';
import { useVolunteerData, useVolunteerHomeRefresh } from '../../hooks';
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
  limit?: number;
  linkTitle?: string;
  navigate?: () => void;
  navigateButton?: () => void;
  navigateLink?: () => void;
  navigation: StackNavigationProp<any>;
  placeholder?: React.ReactElement;
  query: VolunteerQuery;
  queryVariables?: { dateRange?: string[] };
  sectionTitle?: string;
  sectionTitleDetail?: string;
  showButton?: boolean;
  showLink?: boolean;
};

export const VolunteerHomeSection = ({
  buttonTitle,
  limit = 3,
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
  const isPersonal =
    query === QUERY_TYPES.VOLUNTEER.GROUPS_MY ||
    query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY ||
    query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS;
  const [showCalendar, setShowCalendar] = useState(isCalendar);
  const { data: sectionData, isLoading, isRefetching, refetch } = useVolunteerData({
    query,
    queryVariables,
    isCalendar,
    onlyUpcoming: !showCalendar
  });

  useVolunteerHomeRefresh(refetch, isPersonal);

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
            calendarData={sectionData}
            isLoading={isLoading || isRefetching}
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
          buttonTitle={buttonTitle}
          linkTitle={linkTitle}
          limit={0}
          navigate={navigate}
          navigation={navigation}
          query={query}
          showButton
          showLink
          navigateButton={navigateButton}
          navigateLink={showAllLink ? navigateLink : undefined}
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
