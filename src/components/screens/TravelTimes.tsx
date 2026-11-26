import moment from 'moment';
import React, { Fragment, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, View } from 'react-native';
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

const MAX_INITIAL_NUM_TO_RENDER = 15;

type RoutePresentation = {
  icon?: string;
  label?: string;
  color?: string;
};

const defaultRouteTypes: Record<string, RoutePresentation> = {
  '0': { icon: 'tram', label: texts.pointOfInterest.routeTypes.tram, color: '#D02E26' },
  '1': { icon: 'metro', label: texts.pointOfInterest.routeTypes.metro, color: '#FFCC14' },
  '2': { icon: 'railway', label: texts.pointOfInterest.routeTypes.railway, color: '#52267D' },
  '3': { icon: 'bus', label: texts.pointOfInterest.routeTypes.bus, color: '#265BA4' }
};

type TravelTimeProps = {
  departureTime: string;
  route: {
    routeShortName: string;
    routeType: string;
  };
  trip: { tripHeadsign: string };
};

export const TravelTimes = ({ id }: { id: string }) => {
  const { colors: colors } = useTheme();
  const { globalSettings } = useContext(SettingsContext);
  const iconSettings = globalSettings?.settings as
    | { icons?: { routeTypes?: Record<string, RoutePresentation> } }
    | undefined;
  const configuredRouteTypes = iconSettings?.icons?.routeTypes;

  const styles = useThemeStyles(createStyles);
  const [today, setToday] = useState<string>(moment().format('YYYY-MM-DDTHH:mm'));
  const [moreData, setMoreData] = useState(1);

  const { data, loading, refetch } = useQuery(
    getQuery(QUERY_TYPES.POINT_OF_INTEREST_TRAVEL_TIMES),
    {
      variables: { id, date: today }
    }
  );

  useDetailRefresh(() => {
    setToday(moment().format('YYYY-MM-DDTHH:mm'));
    refetch();
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

      <Divider style={[styles.divider, { marginTop: normalize(12) }]} />

      {paginatedData?.map((item: TravelTimeProps, index: number) => {
        const { route, trip } = item;
        const departureTime = normalizeTime(item.departureTime);
        const { routeShortName, routeType } = route;
        const { tripHeadsign } = trip;

        const defaults = defaultRouteTypes[routeType];
        const configured = configuredRouteTypes?.[routeType];
        const icon = typeof configured?.icon === 'string' ? configured.icon : defaults?.icon;
        const label = typeof configured?.label === 'string' ? configured.label : defaults?.label;
        const color =
          typeof configured?.color === 'string'
            ? configured.color
            : defaults?.color ?? (icon ? colors.primary : undefined);

        return (
          <Fragment key={index}>
            <ListItem style={styles.container} containerStyle={styles.container}>
              <ListItem.Content style={styles.itemRow}>
                {!!departureTime && (
                  <RegularText style={styles.time}>
                    {momentFormat(departureTime, 'HH:mm', 'HH:mm:ss')}
                  </RegularText>
                )}

                {!!routeShortName && (
                  <View style={styles.typeDirection}>
                    {!!icon && (
                      <View style={[styles.typeIconContainer, { backgroundColor: color }]}>
                        <IconUrl iconName={icon} color={colors.lightestText} size={normalize(16)} />
                      </View>
                    )}
                    <View style={[styles.typeView, { backgroundColor: color }]}>
                      <BoldText lightest={!!color} small center>
                        {label ? `${label} ${routeShortName}` : routeShortName}
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
      {paginatedData?.length !== data?.pointOfInterest?.travelTimes?.length && (
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

const createStyles = (colors) => ({
  container: {
    backgroundColor: colors.transparent,
    paddingVertical: normalize(8)
  },

  divider: {
    backgroundColor: colors.placeholder,
    marginHorizontal: normalize(16)
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
    fontFamily: 'bold',
    fontSize: normalize(14),
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
});
