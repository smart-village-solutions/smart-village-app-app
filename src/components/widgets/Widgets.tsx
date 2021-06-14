import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { WrapperRow } from '../Wrapper';
import { WidgetProps } from '../../types';

import { ConstructionSiteWidget } from './ConstructionSiteWidget';
import { EventWidget } from './EventWidget';
import { WeatherWidget } from './WeatherWidget';
import { LunchWidget } from './LunchWidget';

type WidgetConfig =
  | {
      widgetName: string;
      text?: string;
    }
  | string;

type Props = {
  navigation: NavigationScreenProp<never>;
  widgetConfigs?: WidgetConfig[];
};

const EXISTING_WIDGETS: {
  [key: string]: React.FC<WidgetProps> | undefined;
} = {
  constructionSite: ConstructionSiteWidget,
  event: EventWidget,
  lunch: LunchWidget,
  weather: WeatherWidget
};

export const Widgets = ({ navigation, widgetConfigs }: Props) => {
  if (!widgetConfigs) return null;

  const widgetComponents = widgetConfigs.map((widgetConfig, index) => {
    const widgetName = typeof widgetConfig === 'string' ? widgetConfig : widgetConfig.widgetName;
    const widgetText = typeof widgetConfig === 'string' ? undefined : widgetConfig.text;

    const Component = EXISTING_WIDGETS[widgetName];

    if (!Component) {
      return null;
    }

    return <Component key={index} navigation={navigation} text={widgetText} />;
  });

  const filteredWidgetComponents = widgetComponents.filter((component) => !!component);

  if (!filteredWidgetComponents.length) return null;

  return <WrapperRow spaceAround>{filteredWidgetComponents}</WrapperRow>;
};
