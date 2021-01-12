import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { EventWidget } from './EventWidget';

import { WrapperRow } from '../Wrapper';

import { ConstructionSiteWidget } from './ConstructionSiteWidget';

type Props = {
  navigation: NavigationScreenProp<never>;
  widgets?: string[];
};

const EXISTING_WIDGETS: {
  [key: string]: React.FC<{ navigation: NavigationScreenProp<never> }>;
} = {
  constructionSite: ConstructionSiteWidget,
  event: EventWidget
};

const getExistingWidgets = (widgets: string[]) => {
  const existingWidgets = widgets.map((widget) => EXISTING_WIDGETS[widget]);
  return existingWidgets.filter((item) => item !== undefined);
};

export const Widgets = ({ navigation, widgets }: Props) => {
  if (!widgets) return null;

  const filteredWidgets = getExistingWidgets(widgets);

  if (!filteredWidgets?.length) return null;

  const widgetComponents = filteredWidgets.map((Component, index) => {
    return <Component key={index} navigation={navigation} />;
  });

  return (
    <WrapperRow spaceBetween={filteredWidgets.length > 2} spaceAround={filteredWidgets.length <= 2}>
      {widgetComponents}
    </WrapperRow>
  );
};
