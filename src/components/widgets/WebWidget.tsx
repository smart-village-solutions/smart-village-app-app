import { useNavigation } from '@react-navigation/core';
import React, { useCallback } from 'react';

import { Icon, normalize, texts } from '../../config';
import { ScreenName, WidgetProps } from '../../types';
import { Image } from '../Image';

import { DefaultWidget } from './DefaultWidget';

export const WebWidget = ({ text, additionalProps }: WidgetProps) => {
  const navigation = useNavigation();

  const onPress = useCallback(() => {
    navigation.navigate(ScreenName.Web, {
      title: additionalProps?.staticContentTitle ?? texts.widgets.web,
      webUrl: additionalProps?.webUrl
    });
  }, [navigation, text]);

  return (
    <DefaultWidget
      Icon={() =>
        additionalProps?.image ? (
          <Image
            source={{ url: additionalProps?.image.url }}
            style={{
              height: normalize(additionalProps?.image?.height ?? 26),
              width: normalize(additionalProps?.image?.width ?? 33)
            }}
          />
        ) : (
          <Icon.Url size={normalize(26)} />
        )
      }
      onPress={onPress}
      text={text ?? texts.widgets.web}
    />
  );
};
