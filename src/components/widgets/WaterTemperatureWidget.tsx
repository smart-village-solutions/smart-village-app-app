import { useNavigation } from 'expo-router/react-navigation';
import React, { useCallback } from 'react';

import { Icon, texts } from '../../config';
import { useHomeRefresh } from '../../hooks';
import { useWaterTemperature } from '../../hooks/waterTemperature';
import { QUERY_TYPES } from '../../queries';
import { ScreenName, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

export const WaterTemperatureWidget = ({ text, additionalProps, widgetStyle }: WidgetProps) => {
  const navigation = useNavigation();
  const { temperature, refresh } = useWaterTemperature();

  const onPress = useCallback(() => {
    navigation.navigate(ScreenName.Html, {
      title: additionalProps?.staticContentTitle ?? texts.waterTemperature.headerTitle,
      query: QUERY_TYPES.WATER_TEMPERATURE,
      queryVariables: { name: additionalProps?.staticContentName }
    });
  }, [additionalProps?.staticContentName, additionalProps?.staticContentTitle, navigation]);

  useHomeRefresh(refresh);

  return (
    <DefaultWidget
      count={(temperature ?? '—') + '°C'}
      Icon={(props) => <Icon.NamedIcon {...props} name={additionalProps?.iconName} />}
      image={additionalProps?.image}
      onPress={onPress}
      svg={additionalProps?.svg}
      text={text ?? texts.widgets.water}
      widgetStyle={widgetStyle}
    />
  );
};
