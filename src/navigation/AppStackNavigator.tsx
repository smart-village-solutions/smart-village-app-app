import {
  CardStyleInterpolators,
  createStackNavigator
} from 'expo-router/build/react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccessibilityContext } from '../AccessibilityProvider';
import { ScreenContentWidthContext } from '../ScreenContentWidthContext';
import { StackConfig } from '../types';

const Stack = createStackNavigator<Record<string, { title: string } | undefined>>();

const AppStackNavigator = ({ stackConfig }: { stackConfig: StackConfig }) => {
  const { isReduceMotionEnabled } = useContext(AccessibilityContext);
  const { width } = useWindowDimensions();
  const { left, right } = useSafeAreaInsets();
  const [measurement, setMeasurement] = useState({ width, contentWidth: width - left - right });
  const contentWidth =
    measurement.width === width ? measurement.contentWidth : width - left - right;
  const onLayout = useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
      if (!Number.isFinite(layout.width) || layout.width <= 0) return;

      setMeasurement((current) =>
        current.width === width && current.contentWidth === layout.width
          ? current
          : { width, contentWidth: layout.width }
      );
    },
    [width]
  );

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
        >
          {(props) => (
            <SafeAreaView edges={['left', 'right']} style={styles.screen}>
              <View onLayout={onLayout} style={styles.screen}>
                <ScreenContentWidthContext.Provider value={contentWidth}>
                  <screenConfig.screenComponent {...props} />
                </ScreenContentWidthContext.Provider>
              </View>
            </SafeAreaView>
          )}
        </Stack.Screen>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1
  }
});
