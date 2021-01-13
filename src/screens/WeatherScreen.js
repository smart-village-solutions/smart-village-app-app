import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native';

import {
  DailyWeather,
  HourlyWeather,
  Icon,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  WeatherAlert
} from '../components';
import { colors, consts, normalize } from '../config';
import { graphqlFetchPolicy } from '../helpers';
import { useMatomoTrackScreenView } from '../hooks';
import { arrowLeft } from '../icons';
import { hasDailyWeather, hasHourlyWeather, parseValidAlerts } from '../jsonValidation';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';

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
  const { data, loading } = useQuery(getQuery(QUERY_TYPES.WEATHER_MAP), {
    fetchPolicy,
    pollInterval: consts.POLL_INTERVALS.WEATHER
  });

  useMatomoTrackScreenView(consts.MATOMO_TRACKING.SCREEN_VIEW.WEATHER);

  if (!data?.weatherMap || loading) return null;

  const { weatherMap } = data;
  const alerts = parseValidAlerts(weatherMap);

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        {!!alerts?.length && (
          <TitleContainer>
            <Title>Wetterwarnungen</Title>
          </TitleContainer>
        )}
        {!!alerts?.length &&
          alerts.map((alert, index) => (
            <WeatherAlert
              key={index}
              description={alert.description}
              event={alert.event}
              start={alert.start}
              end={alert.end}
            />
          ))}
        {hasHourlyWeather(weatherMap) && (
          <View>
            <TitleContainer>
              <Title>Aktuelles Wetter</Title>
            </TitleContainer>
            <FlatList
              data={markNow(weatherMap.hourly)}
              horizontal
              keyExtractor={hourlyKeyExtractor}
              renderItem={renderHourlyWeather}
            />
          </View>
        )}
        {hasDailyWeather(weatherMap) && (
          <View>
            <TitleContainer>
              <Title>Wetter der Nächsten Tage</Title>
            </TitleContainer>
            {weatherMap.daily.map((day, index) => (
              <DailyWeather
                key={index}
                icon={day.weather[0].icon}
                temperatures={day.temp}
                date={day.dt}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});

WeatherScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Zurück Taste"
          accessibilityHint="Navigieren zurück zur vorherigen Seite"
        >
          <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};
