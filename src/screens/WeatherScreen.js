import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, View } from 'react-native';

import {
  DailyWeather,
  HeaderLeft,
  HourlyWeather,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  TitleShadow,
  WeatherAlert,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { colors, consts, device, texts } from '../config';
import { graphqlFetchPolicy } from '../helpers';
import { useMatomoTrackScreenView } from '../hooks';
import { hasDailyWeather, hasHourlyWeather, parseValidAlerts } from '../jsonValidation';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';

const { MATOMO_TRACKING, POLL_INTERVALS } = consts;

const hourlyKeyExtractor = (item) => JSON.stringify(item.dt);

const renderHourlyWeather = ({ item }) => {
  return (
    <HourlyWeather
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

export const WeatherScreen = () => {
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
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const refreshControl = (
    <RefreshControl
      refreshing={loading}
      onRefresh={refetch}
      colors={[colors.accent]}
      tintColor={colors.accent}
    />
  );

  if (!data?.weatherMap)
    return (
      <SafeAreaViewFlex>
        <ScrollView
          refreshControl={
            // when loading is true the previous early return should be applied
            refreshControl
          }
        >
          <Wrapper>
            <RegularText>{texts.weather.noData}</RegularText>
          </Wrapper>
        </ScrollView>
      </SafeAreaViewFlex>
    );

  const { weatherMap } = data;
  const alerts = parseValidAlerts(weatherMap);

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={refreshControl}>
        {!!alerts?.length && (
          <WrapperWithOrientation>
            <TitleContainer
              accessibilityLabel={`${texts.weather.alertsHeadline} ${consts.a11yLabel.heading}`}
            >
              <Title>{texts.weather.alertsHeadline}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            {alerts.map((alert, index) => (
              <WeatherAlert
                key={index}
                description={alert.description}
                event={alert.event}
                start={alert.start}
                end={alert.end}
              />
            ))}
          </WrapperWithOrientation>
        )}
        {hasHourlyWeather(weatherMap) && (
          <View>
            <WrapperWithOrientation>
              <TitleContainer
                accessibilityLabel={`${texts.weather.currentHeadline} ${consts.a11yLabel.heading}`}
              >
                <Title>{texts.weather.currentHeadline}</Title>
              </TitleContainer>
              {device.platform === 'ios' && <TitleShadow />}
            </WrapperWithOrientation>
            <FlatList
              data={markNow(weatherMap.hourly)}
              horizontal
              keyExtractor={hourlyKeyExtractor}
              renderItem={renderHourlyWeather}
            />
          </View>
        )}
        {hasDailyWeather(weatherMap) && (
          <WrapperWithOrientation>
            <TitleContainer
              accessibilityLabel={`${texts.weather.nextDaysHeadline} ${consts.a11yLabel.heading}`}
            >
              <Title>{texts.weather.nextDaysHeadline}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            {weatherMap.daily.map((day, index) => (
              <DailyWeather
                key={index}
                icon={day.weather[0].icon}
                temperatures={day.temp}
                date={day.dt}
              />
            ))}
          </WrapperWithOrientation>
        )}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

WeatherScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};
