import React from 'react';
import { StyleSheet, View } from 'react-native';
import { normalize } from '../../config';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';
import { WrapperHorizontal } from '../Wrapper';

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
      <WrapperHorizontal>
        {/* TODO: add date/weekday */}
        <BoldText>Datum/Wochentag</BoldText>
        <View style={styles.dailyForecastContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: `http://openweathermap.org/img/wn/${icon}@2x.png` }}
              style={styles.icon}
            />
          </View>
          <View style={styles.infoContainer}>
            <RegularText style={styles.text}>Temperaturen zwischen</RegularText>
            <RegularText style={styles.text}>
              {min}°C und {max}°C
            </RegularText>
            <View style={styles.daytimeWrapper}>
              <View style={styles.dayTimeEntry}>
                <RegularText>Morgens</RegularText>
                <RegularText>{morn}°C</RegularText>
              </View>
              <View style={styles.dayTimeEntry}>
                <RegularText>Mittags</RegularText>
                <RegularText>{day}°C</RegularText>
              </View>
              <View style={styles.dayTimeEntry}>
                <RegularText>Abends</RegularText>
                <RegularText>{eve}°C</RegularText>
              </View>
              <View style={styles.dayTimeEntry}>
                <RegularText>Nachts</RegularText>
                <RegularText>{night}°C</RegularText>
              </View>
            </View>
          </View>
        </View>
      </WrapperHorizontal>
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
  },
  text: {
    textAlign: 'center'
  }
});
