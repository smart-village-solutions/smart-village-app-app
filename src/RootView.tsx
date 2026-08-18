import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useContext, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { AccessibilityContext } from './AccessibilityProvider';
import { AppWideGrayscaleFilter } from './components/AppWideGrayscaleFilter';
import { AppStatusBar } from './components/AppStatusBar';
import { fontConfig, SUE_REPORT_VALUES } from './config';
import { useTheme } from './hooks/useTheme';

const RootView = ({ children }: { children: React.ReactNode }) => {
  const [isFontLoaded] = useFonts(fontConfig);
  const { features, isGrayscaleEnabled, isHydrated } = useContext(AccessibilityContext);
  const { colors } = useTheme();
  const hasHandledInitialLayout = useRef(false);

  const onLayoutRootView = useCallback(async () => {
    if (isFontLoaded && !hasHandledInitialLayout.current) {
      hasHandledInitialLayout.current = true;

      // when the application is closed and reopened, the saved data in the sue report form is deleted
      await AsyncStorage.removeItem(SUE_REPORT_VALUES);

      // Keep the native splash visible until the hydrated theme has rendered
      // and the root view has performed layout. This prevents a light blank
      // frame from appearing before a dark-themed app becomes visible.
      await SplashScreen.hideAsync();
    }
  }, [isFontLoaded]);

  if (!isFontLoaded || (features?.theming && !isHydrated)) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} onLayout={onLayoutRootView}>
      <AppStatusBar backgroundColor={colors.background} />
      <AppWideGrayscaleFilter isGrayscaleEnabled={isGrayscaleEnabled}>
        {children}
      </AppWideGrayscaleFilter>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});

export default RootView;
