import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { StackConfig } from '../types';

const Stack = createStackNavigator<Record<string, { title: string } | undefined>>();

export const getStackNavigator = (stackConfig: StackConfig) => () =>
  (
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
          initialParams={screenConfig.inititalParams}
        />
      ))}
    </Stack.Navigator>
  );
