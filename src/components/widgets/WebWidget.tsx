import { useNavigation } from 'expo-router/react-navigation';
import React, { useCallback } from 'react';

import { Icon, normalize } from '../../config';
import { ScreenName, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

export const WebWidget = ({ text = '', additionalProps, widgetStyle }: WidgetProps) => {
  const navigation = useNavigation();

  const onPress = useCallback(() => {
    navigation.navigate(ScreenName.Web, {
      inModalBrowser: additionalProps?.inModalBrowser,
      isExternal: additionalProps?.isExternal,
      isIncognito: additionalProps?.isIncognito,
      title: additionalProps?.staticContentTitle,
      webUrl: additionalProps?.webUrl
    });
  }, [navigation, text]);

  return (
    <DefaultWidget
      Icon={(props) => <Icon.Url {...props} size={normalize(26)} />}
      image={additionalProps?.image}
      onPress={onPress}
      text={text}
      widgetStyle={widgetStyle}
    />
  );
};
