import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

type Props = {
  navigation: NavigationScreenProp<never>;
  widgets?: string[];
};

const EXISTING_WIDGETS: {
  [key: string]: React.FC<{ navigation: NavigationScreenProp<never> }>;
} = {};

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

  return <View style={styles.container}>{widgetComponents}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
