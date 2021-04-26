import gql from 'graphql-tag';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Calendar, DateObject, LocaleConfig, MultiDotMarking } from 'react-native-calendars';
import { NavigationScreenProp, SectionList } from 'react-navigation';

import {
  HeaderLeft,
  Icon,
  NoTouchDay,
  SafeAreaViewFlex,
  SectionHeader,
  WrapperWithOrientation
} from '../../components';
import { OParlPreviewComponent } from '../../components/oParl';
import { colors, normalize } from '../../config';
import { momentFormat } from '../../helpers';
import { arrowLeft, arrowRight } from '../../icons';
import { executeOParlQuery } from '../../OParlProvider';
import { MeetingPreviewData } from '../../types';

type Props = {
  navigation: NavigationScreenProp<never>;
};

const dotSize = 6;

LocaleConfig.locales['de'] = {
  monthNames: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember'
  ],
  monthNamesShort: [
    'Jan.',
    'Feb.',
    'Mär.',
    'Apr.',
    'Mai',
    'Jun.',
    'Jul.',
    'Aug.',
    'Sep.',
    'Okt.',
    'Nov.',
    'Dez.'
  ],
  dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  dayNamesShort: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
  today: 'Heute'
};
LocaleConfig.defaultLocale = 'de';

const dot = { key: 'dot', color: colors.primary };

const renderArrow = (direction: 'left' | 'right') =>
  direction === 'right' ? (
    <Icon xml={arrowRight(colors.primary)} style={styles.icon} />
  ) : (
    <Icon xml={arrowLeft(colors.primary)} style={styles.icon} />
  );

const meetingsQuery = [
  gql`
    query meetings($before: String, $after: String) {
      oParlMeetings(before: $before, after: $after) {
        start
        id: externalId
        type
        cancelled
        deleted
        name
      }
    }
  `,
  'oParlMeetings'
] as const;

const getSectionsAndDots = (meetings: MeetingPreviewData[]) => {
  const filteredMeetings = meetings.filter((meeting) => !!meeting.start) as (MeetingPreviewData & {
    start: number;
  })[];
  filteredMeetings.sort((a, b) => a.start - b.start);

  const o: Record<string, typeof filteredMeetings> = {};

  const markedDates: { [date: string]: MultiDotMarking } = {};

  filteredMeetings.forEach((meeting) => {
    const startDateString = momentFormat(meeting.start, 'DD.MM.YYYY', 'x');
    const markDateString = momentFormat(meeting.start, 'YYYY-MM-DD', 'x');

    markedDates[markDateString] = { dots: [dot] };

    if (o[startDateString]) {
      o[startDateString].push(meeting);
    } else {
      o[startDateString] = [meeting];
    }
  });

  const sections = Object.keys(o).map((date) => ({
    title: date,
    data: o[date]
  }));

  return { sections, markedDates };
};

const renderSectionHeader = ({
  section: { title, data }
}: {
  section: {
    title: string;
    data: (MeetingPreviewData & {
      start: number;
    })[];
  };
}) => {
  if (!data?.length) return null;

  return <SectionHeader title={title} />;
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

export const OParlCalendarScreen = ({ navigation }: Props) => {
  const [limits, setLimits] = useState(getMonthLimits);
  const [meetings, setMeetings] = useState([]);

  // parse meetings into sections
  const { markedDates, sections } = getSectionsAndDots(meetings);

  const updateMonth = useCallback(
    (date) => {
      setLimits(getMonthLimits(date));
    },
    [setLimits]
  );

  // get meetings
  useEffect(() => {
    executeOParlQuery(meetingsQuery, setMeetings, limits);
  }, [limits]);

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <WrapperWithOrientation>
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
          <SectionList
            sections={sections}
            renderSectionHeader={renderSectionHeader}
            renderItem={({ item }) => <OParlPreviewComponent data={item} navigation={navigation} />}
          />
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});

OParlCalendarScreen.navigationOptions = ({ navigation }: Props) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

OParlCalendarScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
