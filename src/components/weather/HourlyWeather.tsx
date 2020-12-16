import React from 'react';
import { StyleSheet, View } from 'react-native';
import { normalize } from '../../config';
import { Image } from '../Image';
import { RegularText } from '../Text';

export type HourlyWeatherData = {
  icon: string;
  temperature: number;
  time: number;
};

export const HourlyWeather = ({ icon, temperature, time }: HourlyWeatherData) => {
  // TODO: proper time
  return (
    <View style={styles.container}>
      <RegularText>{time}</RegularText>
      <Image
        source={{ uri: `http://openweathermap.org/img/wn/${icon}@2x.png` }}
        style={styles.icon}
      />
      <RegularText>{temperature}°C</RegularText>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    aspectRatio: 1,
    resizeMode: 'contain',
    width: normalize(50)
  },
  container: {
    alignItems: 'center',
    paddingVertical: normalize(7)
  }
});
