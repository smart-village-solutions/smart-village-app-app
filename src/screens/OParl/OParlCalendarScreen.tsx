import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import { Calendar, DateObject, MultiDotMarking } from 'react-native-calendars';

import { NoTouchDay, RegularText, renderArrow, SafeAreaViewFlex, Wrapper } from '../../components';
import { OParlPreviewSection } from '../../components/oParl/sections';
import { colors, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { setupLocales } from '../../helpers/calendarHelper';
import { useOParlQuery } from '../../hooks';
import { meetingListQuery } from '../../queries/OParl/meeting';
import { MeetingPreviewData } from '../../types';

type Props = {
  navigation: StackNavigationProp<never>;
};

setupLocales();

const dotSize = 6;

const dot = { key: 'dot', color: colors.primary };

const filterAndSortMeetings = (
  meetings: MeetingPreviewData[]
): (MeetingPreviewData & {
  start: number;
})[] => {
  const filteredMeetings = meetings.filter((meeting) => !!meeting.start) as (MeetingPreviewData & {
    start: number;
  })[];
  return filteredMeetings.sort((a, b) => a.start - b.start);
};

const getSectionsAndDots = (
  sortedAndfilteredMeetings: (MeetingPreviewData & {
    start: number;
  })[]
) => {
  const meetingsPerDate: Record<string, typeof sortedAndfilteredMeetings> = {};

  const markedDates: { [date: string]: MultiDotMarking } = {};

  sortedAndfilteredMeetings.forEach((meeting) => {
    const startDateString = momentFormat(meeting.start, 'DD.MM.YYYY', 'x');
    const markDateString = momentFormat(meeting.start, 'YYYY-MM-DD', 'x');

    markedDates[markDateString] = { dots: [dot] };

    if (meetingsPerDate[startDateString]) {
      meetingsPerDate[startDateString].push(meeting);
    } else {
      meetingsPerDate[startDateString] = [meeting];
    }
  });

  return { markedDates };
};

const getMonthLimits = (date?: DateObject) => {
  const now = moment(date?.timestamp ?? new Date());

  const startOfCurrentMonth = now.startOf('month');
  const startOfNextMonth = moment(startOfCurrentMonth).add(1, 'M');

  return {
    after: startOfCurrentMonth.format('YYYY-MM-DD'),
    before: startOfNextMonth.format('YYYY-MM-DD')
  };
};

const [query, queryName] = meetingListQuery;

export const OParlCalendarScreen = ({ navigation }: Props) => {
  const [limits, setLimits] = useState(getMonthLimits());

  const { data, error, loading } = useOParlQuery<{ [queryName]: MeetingPreviewData[] }>(query, {
    variables: limits
  });

  const meetings = (!loading ? data?.[queryName] : undefined) ?? [];

  // parse meetings into sections

  const filteredAndSortedMeetings = filterAndSortMeetings(meetings);
  const { markedDates } = getSectionsAndDots(filteredAndSortedMeetings);

  const updateMonth = useCallback(
    (date) => {
      setLimits(getMonthLimits(date));
    },
    [setLimits]
  );

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <Calendar
          dayComponent={NoTouchDay}
          onMonthChange={updateMonth}
          markingType="multi-dot"
          markedDates={markedDates}
          renderArrow={renderArrow}
          theme={{
            todayTextColor: colors.primary,
            dotStyle: {
              borderRadius: dotSize / 2,
              height: dotSize,
              width: dotSize
            }
          }}
        />
        {!!error && (
          <Wrapper>
            <RegularText center>{texts.errors.noData}</RegularText>
          </Wrapper>
        )}
        <OParlPreviewSection data={filteredAndSortedMeetings} navigation={navigation} />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

OParlCalendarScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
