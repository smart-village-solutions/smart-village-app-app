import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Calendar, DateObject, MultiDotMarking } from 'react-native-calendars';
import { NavigationScreenProp, SectionList } from 'react-navigation';

import {
  HeaderLeft,
  NoTouchDay,
  RegularText,
  renderArrow,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperVertical,
  WrapperWithOrientation
} from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OParlPreviewComponent } from '../../components/oParl';
import { colors, texts } from '../../config';
import { momentFormat, setupLocales } from '../../helpers';
import { useOParlQuery } from '../../hooks';
import { meetingListQuery } from '../../queries/OParl/meeting';
import { MeetingPreviewData } from '../../types';

type Props = {
  navigation: NavigationScreenProp<never>;
};

setupLocales();

const dotSize = 6;

const dot = { key: 'dot', color: colors.primary };

const getSectionsAndDots = (meetings: MeetingPreviewData[]) => {
  const filteredMeetings = meetings.filter((meeting) => !!meeting.start) as (MeetingPreviewData & {
    start: number;
  })[];
  filteredMeetings.sort((a, b) => a.start - b.start);

  const meetingsPerDate: Record<string, typeof filteredMeetings> = {};

  const markedDates: { [date: string]: MultiDotMarking } = {};

  filteredMeetings.forEach((meeting) => {
    const startDateString = momentFormat(meeting.start, 'DD.MM.YYYY', 'x');
    const markDateString = momentFormat(meeting.start, 'YYYY-MM-DD', 'x');

    markedDates[markDateString] = { dots: [dot] };

    if (meetingsPerDate[startDateString]) {
      meetingsPerDate[startDateString].push(meeting);
    } else {
      meetingsPerDate[startDateString] = [meeting];
    }
  });

  const sections = Object.keys(meetingsPerDate).map((date) => ({
    title: date,
    data: meetingsPerDate[date]
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

const [query, queryName] = meetingListQuery;

export const OParlCalendarScreen = ({ navigation }: Props) => {
  const [limits, setLimits] = useState(getMonthLimits);

  const { data, error, loading } = useOParlQuery<{ [queryName]: MeetingPreviewData[] }>(query, {
    variables: limits
  });

  const meetings = data?.[queryName] ?? [];

  // parse meetings into sections
  const { markedDates, sections } = getSectionsAndDots(meetings);

  const updateMonth = useCallback(
    (date) => {
      setLimits(getMonthLimits(date));
    },
    [setLimits]
  );

  return (
    <SafeAreaViewFlex>
      <WrapperWithOrientation>
        <SectionList
          ListHeaderComponent={
            <WrapperVertical style={styles.noPaddingTop}>
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
                  <RegularText>{texts.errors.noData}</RegularText>
                </Wrapper>
              )}
            </WrapperVertical>
          }
          ListFooterComponent={<LoadingSpinner loading={loading} />}
          sections={sections}
          renderSectionHeader={renderSectionHeader}
          renderItem={({ item }) => <OParlPreviewComponent data={item} navigation={navigation} />}
        />
      </WrapperWithOrientation>
    </SafeAreaViewFlex>
  );
};

OParlCalendarScreen.navigationOptions = ({ navigation }: Props) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

OParlCalendarScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
