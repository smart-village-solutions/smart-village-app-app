import { useNavigation } from '@react-navigation/core';
import React, { useCallback } from 'react';

import { Icon, normalize, texts } from '../../config';
import { useHomeRefresh } from '../../hooks';
import { useWaterTemperature } from '../../hooks/waterTemperature';
import { QUERY_TYPES } from '../../queries';
import { ScreenName, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

export const WaterTemperatureWidget = ({ text, additionalProps }: WidgetProps) => {
  const navigation = useNavigation();
  const { temperature, refresh } = useWaterTemperature();

  const onPress = useCallback(() => {
    navigation.navigate(ScreenName.Html, {
      title: text ?? texts.waterTemperature.headerTitle,
      query: QUERY_TYPES.WATER_TEMPERATURE,
      queryVariables: { name: additionalProps?.staticContentName ?? 'water-temperature' }
    });
  }, [navigation, text]);

  useHomeRefresh(refresh);

  if (!temperature) return null;

  return (
    <DefaultWidget
      count={(temperature ?? 0) + '°C'}
      Icon={() => (
        <Icon.NamedIcon name={additionalProps?.iconName ?? 'water'} size={normalize(22)} />
      )}
      onPress={onPress}
      text={text ?? texts.widgets.water}
    />
  );
};
