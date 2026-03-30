import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { FloatingButton } from '../components/FloatingButton';
import { StackConfig } from '../types';

const Stack = createStackNavigator<Record<string, { title: string } | undefined>>();

export const getStackNavigator = (stackConfig: StackConfig) => () =>
  (
    // Wrap in a View so FloatingButton can be absolutely positioned
    // inside the stack's bounds (above tab bar in tab apps).
    <View style={styles.flex}>
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
            initialParams={screenConfig.initialParams}
          />
        ))}
      </Stack.Navigator>

      <FloatingButton publicJsonFile="floatingButton" />
    </View>
  );

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});
