import { useNavigation } from '@react-navigation/core';
import React, { useCallback } from 'react';

import { Icon, texts } from '../../config';
import { useConstructionSites, useHomeRefresh } from '../../hooks';
import { WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';
import { testIDs } from '../../config/maestro';

export const ConstructionSiteWidget = ({ text }: WidgetProps) => {
  const navigation = useNavigation();
  const { constructionSites, refresh } = useConstructionSites();

  const onPress = useCallback(() => {
    navigation.navigate('ConstructionSiteOverview', {
      title: text ?? texts.widgets.constructionSites
    });
  }, [navigation, text]);

  useHomeRefresh(refresh);

  return (
    <DefaultWidget
      count={constructionSites?.length ?? 0}
      Icon={Icon.ConstructionSite}
      onPress={onPress}
      testID={testIDs.widgets.constructionSite}
      text={text ?? texts.widgets.constructionSites}
    />
  );
};
