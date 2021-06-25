import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { defaultStackConfig } from '../config/navigation/defaultStackConfig';
import { ScreenName } from '../types';

const Stack = createStackNavigator<Record<string, { title: string } | undefined>>();

export const AppStackNavigator = (headerRight = true) => {
  const stackConfig = defaultStackConfig({ initialRouteName: ScreenName.Home, headerRight });

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
