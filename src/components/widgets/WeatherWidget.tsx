import { useNavigation } from 'expo-router/react-navigation';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet, View } from 'react-native';

import { consts, normalize, texts } from '../../config';
import { graphqlFetchPolicy, normalizeStyleValues } from '../../helpers';
import { useHomeRefresh } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { WidgetProps } from '../../types';
import { Image } from '../Image';
import { BoldText } from '../Text';
import { WrapperRow } from '../Wrapper';

import { WidgetContent } from './WidgetContent';
import { WidgetContainer } from './WidgetContainer';

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
  const roundedTemperature = temperature?.toFixed(0) ?? '—';

  const onPress = useCallback(
    () => navigation?.navigate('Weather', { title: text ?? texts.screenTitles.weather }),
    [navigation, text]
  );

  const { fontStyle = {}, iconStyle = {}, widgetStyle: customWidgetStyle } = widgetStyle || {};

  const normalizedFontStyle = normalizeStyleValues(fontStyle);
  const normalizedIconStyle = normalizeStyleValues(iconStyle);

  useHomeRefresh(refetch);

  return (
    <WidgetContainer
      accessibilityLabel={`${
        text ?? texts.widgets.weather
      } (Aktuell ${roundedTemperature} °C) (Gehe zur Wetterübersicht) ${consts.a11yLabel.button}`}
      onPress={onPress}
      widgetStyle={customWidgetStyle}
    >
      <WidgetContent
        label={text ?? texts.widgets.weather}
        labelStyle={normalizedFontStyle}
        visual={
          <WrapperRow center itemsCenter style={styles.visual}>
            <View style={[styles.iconContainer, normalizedIconStyle]}>
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                  captionText: description
                }}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <BoldText primary big style={styles.temperature}>
              {roundedTemperature}°C
            </BoldText>
          </WrapperRow>
        }
      />
    </WidgetContainer>
  );
};

const styles = StyleSheet.create({
  temperature: {
    flexShrink: 1,
    maxWidth: '100%'
  },
  visual: {
    flexWrap: 'wrap',
    maxWidth: '100%'
  },
  icon: {
    aspectRatio: 1,
    width: normalize(40)
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
