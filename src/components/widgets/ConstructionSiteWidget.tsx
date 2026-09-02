import { useNavigation } from 'expo-router/react-navigation';
import React, { useCallback } from 'react';

import { Icon, texts } from '../../config';
import { useConstructionSites, useHomeRefresh } from '../../hooks';
import { ScreenName, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

export const ConstructionSiteWidget = ({ text, additionalProps, widgetStyle }: WidgetProps) => {
  const navigation = useNavigation();
  const { constructionSites, loading, refresh } = useConstructionSites();

  const onPress = useCallback(() => {
    navigation.navigate(ScreenName.ConstructionSiteOverview, {
      title: text ?? texts.widgets.constructionSites
    });
  }, [navigation, text]);

  useHomeRefresh(refresh);

  const count = constructionSites?.length || 0;

  return (
    <DefaultWidget
      count={loading ? undefined : count}
      Icon={Icon.ConstructionSite}
      image={additionalProps?.image}
      onPress={onPress}
      svg={additionalProps?.svg}
      text={text ?? texts.widgets.constructionSites}
      widgetStyle={widgetStyle}
    />
  );
};
