import { useNavigation } from '@react-navigation/core';
import React from 'react';

import { Icon, texts } from '../../config';
import { WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

export const CustomWidget = ({ text, additionalProps, widgetStyle }: WidgetProps) => {
  const navigation = useNavigation();
  const baseText = text ?? texts.widgets.custom;
  const baseAccessibilityLabel = additionalProps?.accessibilityLabel ?? baseText;
  const actionAccessibilityLabel = additionalProps?.accessibilityActionLabel;
  const accessibilityLabel = actionAccessibilityLabel
    ? `${baseAccessibilityLabel} (${actionAccessibilityLabel})`
    : baseAccessibilityLabel;

  return (
    <DefaultWidget
      Icon={() => <Icon.NamedIcon name={additionalProps?.iconName || 'settings'} />}
      accessibilityLabel={accessibilityLabel}
      image={additionalProps?.image}
      onPress={() => navigation.navigate(additionalProps.routeName, additionalProps.params)}
      text={baseText}
      widgetStyle={widgetStyle}
    />
  );
};
