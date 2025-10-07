import { useNavigation } from '@react-navigation/core';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { consts, normalize, texts } from '../../config';
import { graphqlFetchPolicy, normalizeStyleValues } from '../../helpers';
import { useHomeRefresh } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { WidgetProps } from '../../types';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';
import { WrapperRow, WrapperVertical } from '../Wrapper';

const { POLL_INTERVALS } = consts;

export const WeatherWidget = ({ text, widgetStyle }: WidgetProps) => {
  const navigation = useNavigation();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const queryVariables =
    fetchPolicy === 'network-only'
      ? { fetchPolicy, pollInterval: POLL_INTERVALS.WEATHER }
      : { fetchPolicy };
  const { data, refetch } = useQuery(getQuery(QUERY_TYPES.WEATHER_MAP_CURRENT), queryVariables);

  const icon = data?.weatherMap?.current?.weather?.[0]?.icon ?? '02d';
  const description = data?.weatherMap?.current?.weather?.[0]?.description;
  const temperature = data?.weatherMap?.current?.temp;

  const onPress = useCallback(
    () => navigation?.navigate('Weather', { title: text ?? texts.screenTitles.weather }),
    [navigation, text]
  );

  const { fontStyle, iconStyle, widgetStyle: customWidgetStyle } = widgetStyle || {};

  const normalizedFontStyle = normalizeStyleValues(fontStyle);
  const normalizedIconStyle = normalizeStyleValues(iconStyle);
  const normalizedWidgetStyle = normalizeStyleValues(customWidgetStyle);

  useHomeRefresh(refetch);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.widget, normalizedWidgetStyle]}>
      <WrapperVertical>
        <WrapperRow center>
          <View style={[styles.iconContainer, normalizedIconStyle]}>
            <Image
              source={{
                uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                captionText: description
              }}
              childrenContainerStyle={styles.icon}
              resizeMode="contain"
            />
          </View>
          <View>
            <BoldText primary big>
              {temperature?.toFixed(0) ?? '—'}°C
            </BoldText>
            <RegularText primary small style={normalizedFontStyle}>
              {text ?? texts.widgets.weather}
            </RegularText>
          </View>
        </WrapperRow>
      </WrapperVertical>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    aspectRatio: 1,
    width: normalize(44)
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  widget: {
    alignItems: 'center'
  }
});
