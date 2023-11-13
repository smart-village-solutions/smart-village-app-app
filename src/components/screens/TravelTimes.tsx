import _upperFirst from 'lodash/upperFirst';
import moment from 'moment';
import React, { Fragment, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Divider, ListItem } from 'react-native-elements';

import { Icon, colors, normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { QUERY_TYPES, getQuery } from '../../queries';
import { Button } from '../Button';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { BoldText, HeadlineText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

const MAX_INITIAL_NUM_TO_RENDER = 15;

type TravelTimeProps = {
  departureTime: string;
  route: {
    routeShortName: string;
    routeType: string;
  };
  trip: { tripHeadsign: string };
};

export const TravelTimes = ({ id, iconName }: { id: string; iconName: keyof typeof Icon }) => {
  const CategoryIcon = Icon[_upperFirst(iconName) as keyof typeof Icon];
  const [today] = useState<string>(moment().format('YYYY-MM-DDTHH:mm'));
  const [moreData, setMoreData] = useState(1);

  const { data, loading } = useQuery(getQuery(QUERY_TYPES.POINT_OF_INTEREST_TRAVEL_TIMES), {
    variables: { id, date: today }
  });

  if (loading) {
    return (
      <>
        <SectionHeader title={texts.pointOfInterest.departureTimes} />

        <LoadingContainer>
          <ActivityIndicator color={colors.refreshControl} />
        </LoadingContainer>
      </>
    );
  }

  const paginatedData = data?.pointOfInterest?.travelTimes?.slice(
    0,
    moreData * MAX_INITIAL_NUM_TO_RENDER
  );

  return (
    <>
      <SectionHeader title={texts.pointOfInterest.departureTimes} />

      <Wrapper style={styles.noPaddingBottom}>
        <HeadlineText>
          {texts.pointOfInterest.today} {momentFormat(today, 'dd, DD.MM.YYYY')}
        </HeadlineText>
      </Wrapper>

      {paginatedData?.map((item: TravelTimeProps, index: number) => {
        const { departureTime, route, trip } = item;
        const { routeShortName, routeType } = route;
        const { tripHeadsign } = trip;

        const routeTypes: { [key: string]: string } = {
          '0': texts.pointOfInterest.routeTypes.tram,
          '1': texts.pointOfInterest.routeTypes.metro,
          '2': texts.pointOfInterest.routeTypes.railway,
          '3': texts.pointOfInterest.routeTypes.bus
        };

        const routeColors: { [key: string]: string } = {
          '0': '#D02E26',
          '1': '#FFCC14',
          '2': '#52267D',
          '3': '#265BA4'
        };

        const routeIcons: { [key: string]: string } = {
          '0': 'Tram',
          '1': 'Metro',
          '2': 'Railway',
          '3': 'Bus'
        };

        const RouteIcon = Icon[routeIcons[routeType] as keyof typeof Icon] || CategoryIcon;

        return (
          <Fragment key={index}>
            <ListItem style={styles.container} containerStyle={styles.container}>
              <ListItem.Content style={styles.itemRow}>
                {!!departureTime && (
                  <RegularText style={styles.time}>
                    {momentFormat(departureTime, 'HH:mm', 'HH:mm:ss')}
                  </RegularText>
                )}

                {!!routeShortName && !!routeType && (
                  <View style={styles.typeDirection}>
                    <View
                      style={[
                        styles.typeIconContainer,
                        { backgroundColor: routeColors[routeType || '0'] }
                      ]}
                    >
                      <RouteIcon color={colors.lightestText} size={normalize(16)} />
                    </View>
                    <View
                      style={[
                        styles.typeView,
                        { backgroundColor: `${routeColors[routeType || '0']}` }
                      ]}
                    >
                      <BoldText lightest small center>
                        {`${routeTypes[routeType || '0']} ${routeShortName}`}
                      </BoldText>
                    </View>
                  </View>
                )}

                <Icon.ArrowRight2
                  size={normalize(16)}
                  color={colors.darkText}
                  style={styles.icon}
                />

                {!!tripHeadsign && (
                  <RegularText style={styles.headSign}>{tripHeadsign}</RegularText>
                )}
              </ListItem.Content>
            </ListItem>
            {index !== paginatedData?.length - 1 && <Divider style={styles.divider} />}
          </Fragment>
        );
      })}
      {paginatedData?.length !== data?.pointOfInterest?.travelTimes?.length && (
        <Wrapper>
          <Button
            title={texts.pointOfInterest.departureTimesShowMoreButton}
            onPress={() => setMoreData((prev) => prev + 1)}
            notFullWidth
          />
        </Wrapper>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingVertical: normalize(8)
  },
  divider: {
    backgroundColor: colors.placeholder
  },
  headSign: {
    flexShrink: 1
  },
  icon: {
    marginHorizontal: normalize(8)
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  time: {
    fontSize: normalize(14),
    fontWeight: '600',
    lineHeight: normalize(20),
    marginRight: normalize(8)
  },
  typeDirection: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  typeIconContainer: {
    alignItems: 'center',
    borderRadius: normalize(20),
    height: normalize(27),
    justifyContent: 'center',
    marginRight: normalize(5),
    width: normalize(27)
  },
  typeView: {
    alignItems: 'center',
    borderRadius: normalize(4),
    height: normalize(27),
    justifyContent: 'center',
    paddingHorizontal: normalize(4)
  }
});
