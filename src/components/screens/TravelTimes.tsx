import moment from 'moment';
import React, { Fragment, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, TextStyle, View } from 'react-native';
import { Divider, ListItem } from 'react-native-elements';

import { Icon, IconUrl, normalize, texts } from '../../config';
import { momentFormat, normalizeTime } from '../../helpers';
import { useDetailRefresh } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { Button } from '../Button';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { BoldText, HeadlineText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';
import { ThemeColorPalette } from '../../types/Theme';

const MAX_INITIAL_NUM_TO_RENDER = 15;

type TravelTimeProps = {
  departureTime: string;
  estimatedDepartureTime?: string | null;
  departureDelaySeconds?: number | null;
  route: {
    routeShortName: string;
    routeType: string;
  };
  trip: { tripHeadsign: string };
};

const minutesFromDelay = (seconds: number) => Math.max(1, Math.round(Math.abs(seconds) / 60));

const delayLabel = (seconds: number) =>
  `${seconds > 0 ? '+' : '−'}${minutesFromDelay(seconds)} Min.`;

export const TravelTimes = ({ id }: { id: string }) => {
  const { colors: colors } = useTheme();
  const { globalSettings } = useContext(SettingsContext);
  const settings = globalSettings?.settings as { travelTimesRealtime?: boolean } | undefined;
  const travelTimesRealtime = settings?.travelTimesRealtime === true;

  const styles = useThemeStyles(createStyles);
  const [today, setToday] = useState<string>(moment().format('YYYY-MM-DDTHH:mm'));
  const [moreData, setMoreData] = useState(1);
  const [timeColumnWidth, setTimeColumnWidth] = useState<number>();

  const { data, error, loading, refetch } = useQuery(
    getQuery(QUERY_TYPES.POINT_OF_INTEREST_TRAVEL_TIMES, { travelTimesRealtime }),
    {
      variables: { id, date: today },
      fetchPolicy: travelTimesRealtime ? 'network-only' : undefined
    }
  );

  useDetailRefresh(() => {
    const date = moment().format('YYYY-MM-DDTHH:mm');

    setToday(date);
    refetch({ id, date });
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

  const travelTimes: TravelTimeProps[] | undefined = data?.pointOfInterest?.travelTimes;
  const paginatedData = travelTimes?.slice(0, moreData * MAX_INITIAL_NUM_TO_RENDER);

  const delayLabels = travelTimesRealtime
    ? Array.from(
        new Set(
          travelTimes
            ?.filter(
              (item) =>
                item.departureDelaySeconds && (item.estimatedDepartureTime || item.departureTime)
            )
            .map((item) => delayLabel(item.departureDelaySeconds ?? 0))
        )
      )
    : [];

  const renderDepartureTime = (item: TravelTimeProps) => {
    const departureTime = normalizeTime(item.estimatedDepartureTime || item.departureTime);
    const delaySeconds = item.departureDelaySeconds ?? 0;
    const isLate = delaySeconds > 0;

    if (!departureTime && !travelTimesRealtime) return null;

    return (
      <View style={[styles.timeColumn, travelTimesRealtime && { width: timeColumnWidth }]}>
        {!!departureTime && (
          <>
            <RegularText style={styles.time}>
              {momentFormat(departureTime, 'HH:mm', 'HH:mm:ss')}
            </RegularText>
            {delaySeconds !== 0 && (
              <RegularText
                smallest
                accessibilityLabel={texts.pointOfInterest.departureDeviation(
                  minutesFromDelay(delaySeconds),
                  isLate
                )}
                style={isLate ? styles.lateDeparture : styles.earlyDeparture}
              >
                {delayLabel(delaySeconds)}
              </RegularText>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <>
      <SectionHeader title={texts.pointOfInterest.departureTimes} />

      <Wrapper style={styles.noPaddingBottom}>
        <HeadlineText>
          {texts.pointOfInterest.today} {momentFormat(today, 'dd, DD.MM.YYYY')}
        </HeadlineText>
      </Wrapper>

      <Divider style={[styles.divider, { marginTop: normalize(12) }]} />

      {!error && travelTimes?.length === 0 && (
        <Wrapper>
          <RegularText style={styles.emptyStateText}>
            {texts.pointOfInterest.noMoreDeparturesToday}
          </RegularText>
        </Wrapper>
      )}

      {travelTimesRealtime && !!travelTimes?.length && (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onLayout={({ nativeEvent }) => setTimeColumnWidth(Math.ceil(nativeEvent.layout.width))}
          pointerEvents="none"
          style={styles.timeColumnMeasurement}
        >
          <RegularText style={styles.time}>00:00</RegularText>
          {delayLabels.map((label) => (
            <RegularText key={label} smallest>
              {label}
            </RegularText>
          ))}
        </View>
      )}

      {paginatedData?.map((item: TravelTimeProps, index: number) => {
        const { route, trip } = item;
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
          '0': 'tram',
          '1': 'metro',
          '2': 'railway',
          '3': 'bus'
        };

        return (
          <Fragment key={index}>
            <ListItem style={styles.container} containerStyle={styles.container}>
              <ListItem.Content style={styles.itemRow}>
                {renderDepartureTime(item)}

                {!!routeShortName && !!routeType && (
                  <View style={styles.typeDirection}>
                    <View
                      style={[
                        styles.typeIconContainer,
                        { backgroundColor: routeColors[routeType || '0'] }
                      ]}
                    >
                      <IconUrl
                        iconName={routeIcons[routeType || '0']}
                        color={colors.lightestText}
                        size={normalize(16)}
                      />
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
            <Divider style={styles.divider} />
          </Fragment>
        );
      })}
      {paginatedData?.length !== travelTimes?.length && (
        <Wrapper>
          <Button
            invert
            notFullWidth
            onPress={() => setMoreData((prev) => prev + 1)}
            title={texts.pointOfInterest.departureTimesShowMoreButton}
          />
        </Wrapper>
      )}
    </>
  );
};

const createStyles = (colors: ThemeColorPalette) =>
  ({
    container: {
      backgroundColor: colors.transparent,
      paddingVertical: normalize(8)
    },

    divider: {
      backgroundColor: colors.placeholder,
      marginHorizontal: normalize(16)
    },

    earlyDeparture: {
      color: colors.calendarTodayText
    },
    emptyStateText: {
      color: colors.placeholder
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

    lateDeparture: {
      color: colors.error
    },
    noPaddingBottom: {
      paddingBottom: 0
    },

    time: {
      fontFamily: 'bold',
      fontSize: normalize(14),
      fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
      lineHeight: normalize(20)
    },
    timeColumn: {
      marginRight: normalize(8)
    },

    timeColumnMeasurement: {
      alignItems: 'flex-start',
      left: 0,
      maxWidth: '35%',
      opacity: 0,
      position: 'absolute',
      top: 0
    },
    typeDirection: {
      alignItems: 'center',
      flexDirection: 'row'
    },

    typeIconContainer: {
      alignItems: 'center',
      borderRadius: normalize(20),
      height: normalize(22),
      justifyContent: 'center',
      marginRight: normalize(5),
      width: normalize(22)
    },

    typeView: {
      alignItems: 'center',
      borderRadius: normalize(4),
      height: normalize(22),
      justifyContent: 'center',
      paddingHorizontal: normalize(4)
    }
  } as const);
