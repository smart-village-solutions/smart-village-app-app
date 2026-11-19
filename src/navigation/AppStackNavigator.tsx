import {
  CardStyleInterpolators,
  createStackNavigator
} from 'expo-router/build/react-navigation/stack';
import React, { useContext } from 'react';

import { AccessibilityContext } from '../AccessibilityProvider';
import { QUERY_TYPES } from '../queries/types';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName, StackConfig } from '../types/Navigation';

type StackParams = Record<string, { title: string; query?: string } | undefined>;

const Stack = createStackNavigator<StackParams>();

const AppStackNavigator = ({ stackConfig }: { stackConfig: StackConfig }) => {
  const { isReduceMotionEnabled } = useContext(AccessibilityContext);
  const { globalSettings } = useContext(SettingsContext);
  const sections: { eventDetailTitle?: unknown } = globalSettings?.sections ?? {};
  const { eventDetailTitle } = sections;

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
          options={(optionsArgs) => {
            const resolvedOptions =
              typeof screenConfig.screenOptions === 'function'
                ? screenConfig.screenOptions(optionsArgs)
                : screenConfig.screenOptions || {};
            const eventTitle =
              screenConfig.routeName === ScreenName.Detail &&
              optionsArgs.route.params?.query === QUERY_TYPES.EVENT_RECORD &&
              typeof eventDetailTitle === 'string'
                ? eventDetailTitle
                : undefined;

            return {
              ...resolvedOptions,
              ...(eventTitle ? { title: eventTitle } : {}),
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

export const getStackNavigator = (stackConfig: StackConfig) => () =>
  <AppStackNavigator stackConfig={stackConfig} />;

export const createStackNavigatorResolver = () => {
  const navigators = new Map<
    string,
    {
      Component: React.ComponentType;
      stackConfigRef: { current: StackConfig };
    }
  >();

  return (key: string, stackConfig: StackConfig) => {
    const cachedNavigator = navigators.get(key);

    if (cachedNavigator) {
      cachedNavigator.stackConfigRef.current = stackConfig;
      return cachedNavigator.Component;
    }

    const stackConfigRef = { current: stackConfig };
    const ResolvedStackNavigator = () => <AppStackNavigator stackConfig={stackConfigRef.current} />;

    ResolvedStackNavigator.displayName = `StackNavigator(${key})`;
    navigators.set(key, { Component: ResolvedStackNavigator, stackConfigRef });

    return ResolvedStackNavigator;
  };
};
