import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useContext, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { AccessibilityContext } from './AccessibilityProvider';
import { AppWideGrayscaleFilter } from './components/AppWideGrayscaleFilter';
import { fontConfig } from './config';
import { useTheme } from './hooks/useTheme';
import { SUE_REPORT_VALUES } from './screens';

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

      // This tells the splash screen to hide immediately! If we call this after
      // `isFontLoaded`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [isFontLoaded]);

  if (!isFontLoaded || (features?.theming && !isHydrated)) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} onLayout={onLayoutRootView}>
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
