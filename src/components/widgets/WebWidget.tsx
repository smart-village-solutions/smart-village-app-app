import { useNavigation } from '@react-navigation/core';
import React, { useCallback } from 'react';

import { Icon, normalize } from '../../config';
import { ScreenName, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

const buildWebWidgetAccessibilityLabel = (targetLabel: string, webUrl?: string) => {
  if (!webUrl) return `Gehe zu ${targetLabel}`;

  try {
    const host = new URL(webUrl).hostname.replace(/^www\./, '');
    return `Gehe zu ${host || targetLabel}`;
  } catch {
    return `Gehe zu ${targetLabel}`;
  }
};

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
  }, [
    additionalProps?.inModalBrowser,
    additionalProps?.isExternal,
    additionalProps?.isIncognito,
    additionalProps?.staticContentTitle,
    additionalProps?.webUrl,
    navigation
  ]);

  return (
    <DefaultWidget
      Icon={(props) => <Icon.Url {...props} size={normalize(26)} />}
      accessibilityLabel={buildWebWidgetAccessibilityLabel(
        text || additionalProps?.staticContentTitle || 'Website',
        additionalProps?.webUrl
      )}
      image={additionalProps?.image}
      onPress={onPress}
      text={text}
      widgetStyle={widgetStyle}
    />
  );
};
