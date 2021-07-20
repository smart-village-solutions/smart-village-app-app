import React from 'react';

import { WidgetProps } from '../../types';
import { WrapperRow } from '../Wrapper';

import { ConstructionSiteWidget } from './ConstructionSiteWidget';
import { EventWidget } from './EventWidget';
import { LunchWidget } from './LunchWidget';
import { SurveyWidget } from './SurveyWidget';
import { WeatherWidget } from './WeatherWidget';

type WidgetConfig =
  | {
      widgetName: string;
      text?: string;
    }
  | string;

type Props = {
  widgetConfigs?: WidgetConfig[];
};

const EXISTING_WIDGETS: {
  [key: string]: React.FC<WidgetProps> | undefined;
} = {
  constructionSite: ConstructionSiteWidget,
  event: EventWidget,
  lunch: LunchWidget,
  survey: SurveyWidget,
  weather: WeatherWidget
};

export const Widgets = ({ widgetConfigs }: Props) => {
  if (!widgetConfigs) return null;

  const widgetComponents = widgetConfigs.map((widgetConfig, index) => {
    const widgetName = typeof widgetConfig === 'string' ? widgetConfig : widgetConfig.widgetName;
    const widgetText = typeof widgetConfig === 'string' ? undefined : widgetConfig.text;

    const Component = EXISTING_WIDGETS[widgetName];

    if (!Component) {
      return null;
    }

    return <Component key={index} text={widgetText} />;
  });

  const filteredWidgetComponents = widgetComponents.filter((component) => !!component);

  if (!filteredWidgetComponents.length) return null;

  return <WrapperRow spaceAround>{filteredWidgetComponents}</WrapperRow>;
};
