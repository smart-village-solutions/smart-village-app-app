import moment from 'moment';
import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';

import {
  DailyWeather,
  HourlyWeather,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  WeatherAlert,
  Wrapper,
  WrapperHorizontal,
  WrapperRow,
  WrapperVertical
} from '../components';
import { colors, consts, Icon, normalize, texts } from '../config';
import { graphqlFetchPolicy, momentFormat } from '../helpers';
import { useMatomoTrackScreenView } from '../hooks';
import { hasDailyWeather, hasHourlyWeather, parseValidAlerts } from '../jsonValidation';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

const { MATOMO_TRACKING, POLL_INTERVALS } = consts;

const hourlyKeyExtractor = (item) => JSON.stringify(item.dt);

const renderHourlyWeather = ({ item }) => {
  return (
    <HourlyWeather
      description={item.weather[0].description}
      icon={item.weather[0].icon}
      isNow={item.isNow}
      temperature={item.temp}
      time={item.dt}
    />
  );
};

const markNow = (data) => {
  const now = new Date().getTime();
  const idx = data.findIndex((item) => item.dt * 1000 > now);

  // mark the data set that has the latest time that has not passed yet as current
  data[Math.max(0, idx - 1)].isNow = true;
  return data;
};

/* eslint-disable complexity */
export const WeatherScreen = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { flat = false, weather = {} } = settings;
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const queryVariables =
    fetchPolicy === 'network-only'
      ? { fetchPolicy, pollInterval: POLL_INTERVALS.WEATHER }
      : { fetchPolicy };
  const { data, loading, refetch } = useQuery(getQuery(QUERY_TYPES.WEATHER_MAP), queryVariables);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.WEATHER);

  if (loading && !data?.weatherMap) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }
  const refreshControl = (
    <RefreshControl
      refreshing={loading}
      onRefresh={refetch}
      colors={[colors.refreshControl]}
      tintColor={colors.refreshControl}
    />
  );

  if (!data?.weatherMap) {
    // when loading is true the previous early return should be applied
    return (
      <SafeAreaViewFlex>
        <ScrollView refreshControl={refreshControl}>
          <Wrapper>
            <RegularText>{texts.weather.noData}</RegularText>
          </Wrapper>
        </ScrollView>
      </SafeAreaViewFlex>
    );
  }

  const { weatherMap } = data;

  if (!weatherMap) {
    return null;
  }

  const alerts = weather?.showAlerts ? parseValidAlerts(weatherMap) : [];
  const currentDailyWeather = weatherMap.daily[0];
  const currentWeather = weatherMap.current;

  if (!currentDailyWeather || !currentWeather) {
    return null;
  }

  const todayTemperatures = currentDailyWeather.temp;
  const { min, max } = todayTemperatures;
  const todaysRainChance = currentDailyWeather.rain ?? 0;
  const sunriseTime = momentFormat(moment.unix(currentWeather.sunrise), 'HH:mm');
  const sunsetTime = momentFormat(moment.unix(currentWeather.sunset), 'HH:mm');
  const currentTemp = currentWeather.temp.toFixed(0);
  const currentWeatherDescription = currentWeather.weather.description;

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={refreshControl}>
        <WrapperHorizontal>
          <WrapperRow spaceBetween>
            <WrapperVertical itemsCenter>
              <Icon.SunUp color={colors.transparent} strokeColor={colors.primary} strokeWidth="2" />
              <RegularText>{sunriseTime}</RegularText>
            </WrapperVertical>
            <Wrapper itemsCenter>
              <Icon.SunDown
                color={colors.transparent}
                strokeColor={colors.primary}
                strokeWidth="2"
              />
              <RegularText>{sunsetTime}</RegularText>
            </Wrapper>
          </WrapperRow>
          <Wrapper tiny itemsCenter>
            <RegularText style={styles.currentTemp}>{currentTemp}°</RegularText>
            {!!currentWeatherDescription && <RegularText>{currentWeatherDescription}</RegularText>}
            <WrapperRow>
              <WrapperRow>
                <Icon.MinTemperature color={colors.darkText} />
                <RegularText>{min.toFixed(0)}°</RegularText>
              </WrapperRow>
              <View style={styles.marginHorizontal} />
              <WrapperRow>
                <Icon.MaxTemperature color={colors.darkText} />
                <RegularText>{max.toFixed(0)}°</RegularText>
              </WrapperRow>
            </WrapperRow>
          </Wrapper>
          <WrapperVertical>
            <WrapperRow itemsCenter>
              <Icon.Rain
                color={colors.transparent}
                strokeColor={colors.blue}
                strokeWidth="2"
                size={normalize(20)}
              />
              <RegularText blue>{todaysRainChance.toFixed(0)}%</RegularText>
            </WrapperRow>
          </WrapperVertical>
        </WrapperHorizontal>
        {!!flat && (
          <Wrapper>
            <View style={styles.separator} />
          </Wrapper>
        )}

        {!!alerts?.length && (
          <>
            <SectionHeader title={texts.weather.alertsHeadline} />
            {alerts.map((alert, index) => (
              <WeatherAlert
                description={alert.description}
                end={alert.end}
                event={alert.event}
                key={index}
                start={alert.start}
              />
            ))}
          </>
        )}

        {hasHourlyWeather(weatherMap) && (
          <>
            <SectionHeader title={texts.weather.currentHeadline} />
            <FlatList
              data={markNow(weatherMap.hourly)}
              horizontal
              keyExtractor={hourlyKeyExtractor}
              renderItem={renderHourlyWeather}
              showsHorizontalScrollIndicator={false}
            />
            <Wrapper>
              <View style={styles.separator} />
            </Wrapper>
          </>
        )}

        {hasDailyWeather(weatherMap) &&
          weatherMap.daily
            .slice(0, 7)
            .map((day, index) => (
              <DailyWeather
                date={day.dt}
                description={day.weather[0].description}
                icon={day.weather[0].icon}
                index={index}
                key={index}
                temperatures={day.temp}
              />
            ))}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  currentTemp: {
    color: colors.primary,
    fontSize: normalize(72),
    lineHeight: normalize(86),
    marginTop: -normalize(20),
    paddingLeft: normalize(30)
  },
  marginHorizontal: {
    marginHorizontal: normalize(5)
  },
  separator: {
    backgroundColor: colors.gray40,
    height: normalize(1)
  }
});
