import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, normalize } from '../../config';
import { momentFormat } from '../../helpers';
import { Image } from '../Image';
import { RegularText } from '../Text';

export type HourlyWeatherData = {
  description: string;
  icon: string;
  isNow?: boolean;
  temperature: number;
  time: number;
};

export const HourlyWeather = ({
  description,
  icon,
  isNow,
  temperature,
  time
}: HourlyWeatherData) => {
  const formattedTime = momentFormat(time * 1000, 'HH:mm', 'x');

  return (
    <View style={[styles.container, isNow && { backgroundColor: colors.lighterPrimary }]}>
      <RegularText>{formattedTime}</RegularText>
      <Image
        source={{
          uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
          captionText: description
        }}
        style={styles.icon}
        resizeMode="contain"
      />
      <RegularText>{temperature.toFixed(1)}°C</RegularText>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    aspectRatio: 1,
    width: normalize(50)
  },
  container: {
    alignItems: 'center',
    padding: normalize(7)
  }
});
