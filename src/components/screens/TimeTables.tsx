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

const TimeTablesListItem = ({ item }: { item: TimeTableProps }) => {
  const { departure_time, route, trip } = item;
  const { route_color, route_short_name, route_text_color, route_type } = route;
  const { trip_headsign } = trip;

  const routeTypes: { [key: string]: string } = {
    '0': texts.pointOfInterest.routeTypes.tram,
    '1': texts.pointOfInterest.routeTypes.metro,
    '2': texts.pointOfInterest.routeTypes.railway,
    '3': texts.pointOfInterest.routeTypes.bus
  };

  return (
    <ListItem bottomDivider containerStyle={styles.listItem}>
      <ListItem.Content>
        <View style={styles.itemRow}>
          {!!departure_time && (
            <RegularText style={styles.time}>
              {moment(departure_time, 'HH:mm:ss').format('HH:mm')}
            </RegularText>
          )}

          {!!route_short_name && !!route_type && (
            <View style={[styles.typeView, { backgroundColor: `#${route_color}` }]}>
              <RegularText style={(styles.typeText, [{ color: `#${route_text_color}` }])} center>
                {`${routeTypes[route_type || '0']} ${route_short_name}`}
              </RegularText>
            </View>
          )}
          <Icon.ArrowRight size={normalize(16)} color={colors.darkText} style={styles.icon} />

          {!!trip_headsign && (
            <RegularText small style={styles.headSign}>
              {trip_headsign}
            </RegularText>
          )}
        </View>
      </ListItem.Content>
    </ListItem>
  );
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

      <FlatList data={travelTimes} renderItem={({ item }) => <TimeTablesListItem item={item} />} />
    </>
  );
};

const styles = StyleSheet.create({
  listItem: {
    height: normalize(73),
    alignItems: 'center'
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  time: {
    marginRight: normalize(8),
    fontWeight: '600',
    fontSize: normalize(14),
    lineHeight: normalize(20)
  },
  typeText: {
    fontWeight: '600',
    fontSize: normalize(12),
    lineHeight: normalize(16)
  },
  typeView: {
    alignItems: 'center',
    borderRadius: normalize(4),
    paddingHorizontal: normalize(4),
    paddingVertical: normalize(3)
  },
  icon: {
    marginHorizontal: normalize(8)
  },
  headSign: {
    flexShrink: 1
  },
  noPadding: {
    paddingBottom: 0
  }
});
