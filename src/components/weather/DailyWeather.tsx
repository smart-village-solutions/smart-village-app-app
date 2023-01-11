import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { normalize } from '../../config';
import { momentFormat } from '../../helpers';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';
import { WrapperHorizontal, WrapperRow } from '../Wrapper';

type Props = {
  date: number;
  description: string;
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

export const DailyWeather = ({ date, description, icon, temperatures }: Props) => {
  const { day, eve, max, min, morn, night } = temperatures;

  return (
    <View>
      <View style={styles.dayContainer}>
        <WrapperHorizontal>
          <WrapperRow>
            <BoldText>{momentFormat(date * 1000, 'dddd', 'x')}</BoldText>
            <RegularText>{momentFormat(date * 1000, ' DD.MM.YYYY', 'x')}</RegularText>
          </WrapperRow>
          <WrapperRow center>
            <View style={styles.iconContainer}>
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                  captionText: description
                }}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <View style={[styles.maxMinContainer, styles.dayTimeEntry]}>
              <BoldText big>{max.toFixed(1)}°C</BoldText>
              <RegularText>{min.toFixed(1)}°C</RegularText>
            </View>
          </WrapperRow>
          <RegularText />
          <WrapperRow spaceBetween>
            <View style={styles.dayTimeEntry}>
              <RegularText>Morgens</RegularText>
              <RegularText>{morn.toFixed(1)}°C</RegularText>
            </View>
            <View style={styles.dayTimeEntry}>
              <RegularText>Mittags</RegularText>
              <RegularText>{day.toFixed(1)}°C</RegularText>
            </View>
            <View style={styles.dayTimeEntry}>
              <RegularText>Abends</RegularText>
              <RegularText>{eve.toFixed(1)}°C</RegularText>
            </View>
            <View style={styles.dayTimeEntry}>
              <RegularText>Nachts</RegularText>
              <RegularText>{night.toFixed(1)}°C</RegularText>
            </View>
          </WrapperRow>
        </WrapperHorizontal>
      </View>
      <Divider />
    </View>
  );
};

const styles = StyleSheet.create({
  dayContainer: {
    paddingVertical: normalize(14)
  },
  dayTimeEntry: {
    alignItems: 'center'
  },
  icon: {
    aspectRatio: 1,
    width: normalize(64)
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(44)
  },
  maxMinContainer: {
    justifyContent: 'center'
  }
});
