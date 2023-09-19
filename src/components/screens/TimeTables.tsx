import moment from 'moment';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';

import { Icon, colors, normalize, texts } from '../../config';
import { SectionHeader } from '../SectionHeader';
import { CategoryText, HeadlineText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

type TimeTableProps = {
  departure_time: string;
  route: {
    route_color: string;
    route_short_name: string;
    route_text_color: string;
    route_type: string;
  };
  trip: { trip_headsign: string };
};

export const TimeTables = ({ travelTimes }: { travelTimes: TimeTableProps[] }) => {
  return (
    <>
      <Wrapper>
        <CategoryText large>{texts.pointOfInterest.station}</CategoryText>
      </Wrapper>

      <SectionHeader title={texts.pointOfInterest.departureTimes} />

      <Wrapper style={styles.noPadding}>
        <HeadlineText extraSmall>
          {texts.pointOfInterest.today} {moment().format('ddd, DD.MM.YYYY')}
        </HeadlineText>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  noPadding: {
    paddingBottom: 0
  }
});
