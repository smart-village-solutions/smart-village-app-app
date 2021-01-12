import PropTypes from 'prop-types';
import React from 'react';
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
import { colors, normalize } from '../config';
import { arrowLeft } from '../icons';

// const { MATOMO_TRACKING } = consts;

const hourlyKeyExtractor = (item) => JSON.stringify(item.time);

const renderHourlyWeather = ({ item }) => {
  return (
    <HourlyWeather
      icon={item.icon}
      isNow={item.isNow}
      temperature={item.temperature}
      time={item.time}
    />
  );
};

const markNow = (dummyData) => {
  const now = new Date().getTime();
  const idx = dummyData.findIndex((item) => item.time > now);

  // mark the data set that has the latest time that has not passed yet as current
  dummyData[Math.max(0, idx - 1)].isNow = true;
};

export const WeatherScreen = () => {
  const temperatures = {
    day: 6.27,
    eve: 4.82,
    max: 7.95,
    min: 2.87,
    morn: 3.33,
    night: 3.41
  };

  const dummyData = [
    { icon: '13d', temperature: 12, time: new Date().getTime() - 3600000 },
    { icon: '03d', temperature: 2, time: new Date().getTime() },
    { icon: '11d', temperature: 32, time: new Date().getTime() + 3600000 }
  ];

  markNow(dummyData);

  // TODO: Add tracking
  // useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.MORE);

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <WeatherAlert
          description="Might rumble a times"
          end={1337}
          event="slight meteor shower"
          start={42}
        />
        <TitleContainer>
          <Title>Aktuelles Wetter</Title>
        </TitleContainer>
        <View>
          <FlatList
            data={dummyData}
            horizontal
            keyExtractor={hourlyKeyExtractor}
            renderItem={renderHourlyWeather}
          />
        </View>
        <TitleContainer>
          <Title>Wetter der Nächsten Tage</Title>
        </TitleContainer>
        <DailyWeather icon={'10d'} temperatures={temperatures} />
        <DailyWeather icon={'10d'} temperatures={temperatures} />
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
