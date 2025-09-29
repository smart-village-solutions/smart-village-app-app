import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { Image } from '../Image';
import { RegularText } from '../Text';
import { WrapperHorizontal, WrapperRow } from '../Wrapper';

type Props = {
  date: number;
  description: string;
  icon: string;
  index: number;
  temperatures: {
    day: number;
    eve: number;
    max: number;
    min: number;
    morn: number;
    night: number;
  };
};

export const DailyWeather = ({ date, description, icon, temperatures, index }: Props) => {
  const { max, min } = temperatures;

  return (
    <WrapperHorizontal>
      <WrapperRow spaceBetween itemsCenter>
        <View style={styles.textWrapper}>
          {index === 0 && <RegularText>{texts.weather.today}</RegularText>}
          {index === 1 && <RegularText>{texts.weather.tomorrow}</RegularText>}
          {index > 1 && <RegularText>{momentFormat(date * 1000, 'DD.MM.', 'x')}</RegularText>}
        </View>
        <Image
          source={{
            uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
            captionText: description
          }}
          style={styles.icon}
          resizeMode="contain"
        />
        <WrapperRow>
          <WrapperRow style={styles.temperatureContainer} itemsCenter>
            <Icon.MinTemperature color={colors.darkText} />
            <RegularText>
              {min < 9.5 ? ' ' : ''}
              {min.toFixed(0)}°
            </RegularText>
          </WrapperRow>
          <View style={styles.marginHorizontal} />
          <WrapperRow style={styles.temperatureContainer} itemsCenter>
            <Icon.MaxTemperature color={colors.darkText} />
            <RegularText>
              {max < 9.5 ? ' ' : ''}
              {max.toFixed(0)}°
            </RegularText>
          </WrapperRow>
        </WrapperRow>
      </WrapperRow>
    </WrapperHorizontal>
  );
};

const styles = StyleSheet.create({
  marginHorizontal: {
    marginHorizontal: normalize(5)
  },
  icon: {
    aspectRatio: 1,
    width: normalize(44)
  },
  temperatureContainer: {
    width: normalize(50)
  },
  textWrapper: {
    width: normalize(70)
  }
});
