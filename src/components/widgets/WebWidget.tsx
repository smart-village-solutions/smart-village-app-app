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
      webUrl: additionalProps?.webUrl,
      title: additionalProps?.staticContentTitle ?? texts.widgets.web
    });
  }, [navigation, text]);

  return (
    <DefaultWidget
      Icon={() =>
        additionalProps?.icon ? (
          <Image
            source={{ url: additionalProps?.icon }}
            style={{
              height: normalize(additionalProps?.iconSize?.height ?? 26),
              width: normalize(additionalProps?.iconSize?.width ?? 33)
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
