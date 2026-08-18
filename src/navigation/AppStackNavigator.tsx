import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';

import { AccessibilityContext } from '../AccessibilityProvider';
import { StackConfig } from '../types';

const Stack = createStackNavigator<Record<string, { title: string } | undefined>>();

export const getStackNavigator = (stackConfig: StackConfig) => () => {
  const { isReduceMotionEnabled } = useContext(AccessibilityContext);

  return (
    <Stack.Navigator
      initialRouteName={stackConfig.initialRouteName}
      screenOptions={(props) => {
        const resolvedOptions =
          typeof stackConfig.screenOptions === 'function'
            ? stackConfig.screenOptions(props)
            : stackConfig.screenOptions || {};

        return {
          ...resolvedOptions,
          animationEnabled: isReduceMotionEnabled ? false : resolvedOptions.animationEnabled,
          cardStyleInterpolator: isReduceMotionEnabled
            ? CardStyleInterpolators.forNoAnimation
            : resolvedOptions.cardStyleInterpolator,
          gestureEnabled: isReduceMotionEnabled ? false : resolvedOptions.gestureEnabled
        };
      }}
    >
      {stackConfig.screenConfigs.map((screenConfig) => (
        <Stack.Screen
          key={screenConfig.routeName}
          name={screenConfig.routeName}
          component={screenConfig.screenComponent}
          options={(props) => {
            const resolvedOptions =
              typeof screenConfig.screenOptions === 'function'
                ? screenConfig.screenOptions(props)
                : screenConfig.screenOptions || {};

            return {
              ...resolvedOptions,
              animationEnabled: isReduceMotionEnabled ? false : resolvedOptions.animationEnabled,
              cardStyleInterpolator: isReduceMotionEnabled
                ? CardStyleInterpolators.forNoAnimation
                : resolvedOptions.cardStyleInterpolator,
              gestureEnabled: isReduceMotionEnabled ? false : resolvedOptions.gestureEnabled
            };
          }}
          initialParams={screenConfig.initialParams}
        />
      ))}
    </Stack.Navigator>
  );
};
