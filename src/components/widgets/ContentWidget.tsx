import { useNavigation } from '@react-navigation/core';
import React from 'react';

import { Icon, texts } from '../../config';
import { WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

export const ContentWidget = ({ additionalProps }: WidgetProps) => {
  const navigation = useNavigation();

  return additionalProps?.content?.map((content) => (
    <DefaultWidget
      Icon={() => <Icon.NamedIcon name={content.iconName || 'settings'} />}
      image={content?.image}
      onPress={() => navigation.navigate(content.routeName, content.params)}
      text={content.title ?? texts.widgets.content}
    />
  ));
};
