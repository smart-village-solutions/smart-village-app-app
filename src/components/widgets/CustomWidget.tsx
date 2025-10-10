import { useNavigation } from '@react-navigation/core';
import React from 'react';

import { Icon, texts } from '../../config';
import { WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

export const CustomWidget = ({ text, additionalProps, widgetStyle }: WidgetProps) => {
  const navigation = useNavigation();

  return (
    <DefaultWidget
      Icon={() => <Icon.NamedIcon name={additionalProps?.iconName || 'settings'} />}
      image={additionalProps?.image}
      onPress={() => navigation.navigate(additionalProps.routeName, additionalProps.params)}
      text={text ?? texts.widgets.custom}
      widgetStyle={widgetStyle}
    />
  );
};
