import React from 'react';
import { StyleSheet, View } from 'react-native';
import { normalize } from '../../config';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

type Props = {
  icon: string;
  temperatures: {
    day: number;
    eve: number;
    max: number;
    min: number;
    morn: number;
    night: number;
  };
};

export const DailyWeather = ({ icon, temperatures }: Props) => {
  const { day, eve, max, min, morn, night } = temperatures;
  return (
    <View style={styles.dayContainer}>
      <Wrapper>
        {/* TODO: add date/weekday */}
        <BoldText>Montag - 04.01.2021</BoldText>
        <View style={styles.dailyForecastContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: `http://openweathermap.org/img/wn/${icon}@2x.png` }}
              style={styles.icon}
            />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.daytimeWrapper}>
              <View style={styles.dayTimeEntry}>
                <RegularText>Min:</RegularText>
                <RegularText>{min.toFixed(1)}°C</RegularText>
              </View>
              <View style={styles.dayTimeEntry}>
                <RegularText>Morgens</RegularText>
                <RegularText>{morn.toFixed(1)}°C</RegularText>
              </View>
              <View style={styles.dayTimeEntry}>
                <RegularText>Mittags</RegularText>
                <RegularText>{day.toFixed(1)}°C</RegularText>
              </View>
            </View>
            <View style={styles.daytimeWrapper}>
              <View style={styles.dayTimeEntry}>
                <RegularText>Max:</RegularText>
                <RegularText>{max.toFixed(1)}°C</RegularText>
              </View>
              <View style={styles.dayTimeEntry}>
                <RegularText>Abends</RegularText>
                <RegularText>{eve.toFixed(1)}°C</RegularText>
              </View>
              <View style={styles.dayTimeEntry}>
                <RegularText>Nachts</RegularText>
                <RegularText>{night.toFixed(1)}°C</RegularText>
              </View>
            </View>
          </View>
        </View>
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  dayContainer: {
    paddingBottom: normalize(14)
  },
  dayTimeEntry: {
    alignItems: 'center'
  },
  daytimeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dailyForecastContainer: {
    flexDirection: 'row'
  },
  icon: {
    aspectRatio: 1,
    resizeMode: 'contain',
    width: normalize(50)
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: normalize(14)
  }
});
