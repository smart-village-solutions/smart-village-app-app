import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { normalize, texts } from '../../config';
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
  const { isReduceTransparencyEnabled } = useContext(AccessibilityContext);
  const formattedTime = momentFormat(time * 1000, 'HH [Uhr]', 'x');

  return (
    <View style={styles.container}>
      <RegularText lightest={isNow && isReduceTransparencyEnabled}>
        {isNow ? texts.weather.now : formattedTime}
      </RegularText>
      <Image
        source={{
          uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
          captionText: description
        }}
        style={styles.icon}
        resizeMode="contain"
      />
      <RegularText lightest={isNow && isReduceTransparencyEnabled}>
        {temperature.toFixed(0)}°
      </RegularText>
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
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(7)
  }
});
