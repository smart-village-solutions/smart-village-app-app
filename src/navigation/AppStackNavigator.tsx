import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { defaultStackConfig } from '../config/navigation/defaultStackConfig';
import { ScreenName } from '../types';

const Stack = createStackNavigator<Record<string, { title: string } | undefined>>();

export const AppStackNavigator = ({
  initialRouteName = ScreenName.Home,
  headerRight = true
}: {
  initialRouteName?: ScreenName;
  headerRight?: boolean;
}) => {
  const stackConfig = defaultStackConfig({ initialRouteName, headerRight });

  return (
    <Stack.Navigator
      initialRouteName={stackConfig.initialRouteName}
      screenOptions={stackConfig.screenOptions}
    >
      {stackConfig.screenConfigs.map((screenConfig) => (
        <Stack.Screen
          key={screenConfig.routeName}
          name={screenConfig.routeName}
          component={screenConfig.screenComponent}
          options={screenConfig.screenOptions}
        />
      ))}
    </Stack.Navigator>
  );
};
