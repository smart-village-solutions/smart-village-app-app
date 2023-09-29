import _upperFirst from 'lodash/upperFirst';
import React, { Fragment, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Divider, ListItem } from 'react-native-elements';

import { Icon, colors, normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { QUERY_TYPES, getQuery } from '../../queries';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

type TravelTimeProps = {
  departureTime: string;
  route: {
    routeShortName: string;
    routeType: string;
  };
  trip: { tripHeadsign: string };
};

export const TravelTimes = ({
  dataProviderId,
  externalId,
  iconName
}: {
  dataProviderId: string;
  externalId: string;
  iconName: keyof typeof Icon;
}) => {
  const CategoryIcon = Icon[_upperFirst(iconName)];
  const [today] = useState<string>(new Date().toISOString());
  const queryVariables = { dataProviderId, externalId, date: today };

  const { data, loading } = useQuery(getQuery(QUERY_TYPES.TRAVEL_TIMES), {
    variables: queryVariables
  });

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  return (
    <>
      <SectionHeader title={texts.pointOfInterest.departureTimes} />

      <Wrapper style={styles.noPadding}>
        <BoldText small>
          {texts.pointOfInterest.today} {momentFormat(today, 'ddd, DD.MM.YYYY')}
        </BoldText>
      </Wrapper>

      {!!data?.travelTimes?.length &&
        data.travelTimes.map((item: TravelTimeProps, index: number) => {
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
            '0': colors.primary,
            '1': colors.primary,
            '2': colors.primary,
            '3': colors.primary
          };

          return (
            <Fragment key={index}>
              <ListItem style={styles.container}>
                <ListItem.Content style={styles.itemRow}>
                  {!!departureTime && (
                    <RegularText style={styles.time}>
                      {momentFormat(departureTime, 'HH:mm', 'HH:mm:ss')}
                    </RegularText>
                  )}

                  {!!routeShortName && !!routeType && (
                    <View style={styles.typeDirection}>
                      {!!iconName && (
                        <View
                          style={[
                            styles.typeIconContainer,
                            { backgroundColor: routeColors[routeType || '0'] }
                          ]}
                        >
                          <CategoryIcon color={colors.lightestText} size={normalize(16)} />
                        </View>
                      )}
                      <View
                        style={[
                          styles.typeView,
                          { backgroundColor: `${routeColors[routeType || '0']}` }
                        ]}
                      >
                        <RegularText lightest center>
                          {`${routeTypes[routeType || '0']} ${routeShortName}`}
                        </RegularText>
                      </View>
                    </View>
                  )}

                  <Icon.ArrowRight
                    size={normalize(16)}
                    color={colors.darkText}
                    style={styles.icon}
                  />

                  {!!tripHeadsign && (
                    <RegularText small style={styles.headSign}>
                      {tripHeadsign}
                    </RegularText>
                  )}
                </ListItem.Content>
              </ListItem>
              {index !== data.travelTimes.length - 1 && <Divider style={styles.divider} />}
            </Fragment>
          );
        })}
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
  noPadding: {
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
