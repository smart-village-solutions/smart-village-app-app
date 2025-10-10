import { useNavigation } from '@react-navigation/core';
import React, { useCallback } from 'react';

import { Icon, normalize, texts } from '../../config';
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
  }, [navigation, text]);

  useHomeRefresh(refresh);

  return (
    <DefaultWidget
      count={(temperature ?? '—') + '°C'}
      Icon={() => <Icon.NamedIcon name={additionalProps?.iconName} size={normalize(22)} />}
      image={additionalProps?.image}
      onPress={onPress}
      text={text ?? texts.widgets.water}
      widgetStyle={widgetStyle}
    />
  );
};
