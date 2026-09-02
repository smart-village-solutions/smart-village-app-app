import { useNavigation } from 'expo-router/react-navigation';
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
      Icon={(props) => <Icon.NamedIcon {...props} name={additionalProps?.iconName || 'settings'} />}
      accessibilityLabel={accessibilityLabel}
      image={additionalProps?.image}
      onPress={() => navigation.navigate(additionalProps.routeName, additionalProps.params)}
      svg={additionalProps?.svg}
      text={baseText}
      widgetStyle={widgetStyle}
    />
  );
};
