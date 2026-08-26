import { useNavigation } from 'expo-router/react-navigation';
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
import { WrapperRow } from '../Wrapper';

import { omitResponsiveDimensions, WidgetLayoutContext } from './WidgetLayoutContext';

const { POLL_INTERVALS } = consts;

export const WeatherWidget = ({ text, widgetStyle }: WidgetProps) => {
  const { mode } = useContext(WidgetLayoutContext);
  const isList = mode === 'list';
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

  const { fontStyle, iconStyle, widgetStyle: customWidgetStyle } = widgetStyle || {};

  const normalizedFontStyle = normalizeStyleValues(fontStyle);
  const normalizedIconStyle = normalizeStyleValues(iconStyle);
  const normalizedWidgetStyle = omitResponsiveDimensions(normalizeStyleValues(customWidgetStyle));

  useHomeRefresh(refetch);

  return (
    <TouchableOpacity
      accessibilityLabel={`${
        text ?? texts.widgets.weather
      } (Aktuell ${roundedTemperature} °C) (Gehe zur Wetterübersicht) ${consts.a11yLabel.button}`}
      accessibilityRole="button"
      onPress={onPress}
      style={[normalizedWidgetStyle, styles.widget]}
    >
      <View style={[styles.container, isList && styles.listContainer]}>
        <WrapperRow center style={[styles.visualRow, isList && styles.listVisualRow]}>
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
          <BoldText primary big>
            {roundedTemperature}°C
          </BoldText>
        </WrapperRow>
        <View style={[styles.labelContainer, isList && styles.listLabelContainer]}>
          <RegularText
            primary
            small
            style={[styles.label, isList && styles.listLabel, normalizedFontStyle]}
          >
            {text ?? texts.widgets.weather}
          </RegularText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 16,
    width: '100%'
  },
  icon: {
    aspectRatio: 1,
    width: normalize(44)
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    flexShrink: 1,
    textAlign: 'center'
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: 4,
    width: '100%'
  },
  listContainer: {
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 12
  },
  listLabel: {
    textAlign: 'left'
  },
  listLabelContainer: {
    alignItems: 'flex-start',
    flex: 1,
    marginTop: 0,
    width: 'auto'
  },
  listVisualRow: {
    marginRight: 12,
    minWidth: 72
  },
  visualRow: {
    alignItems: 'center',
    minHeight: 44
  },
  widget: {
    alignItems: 'stretch',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%'
  }
});
