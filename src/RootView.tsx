import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useContext, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { AccessibilityContext } from './AccessibilityProvider';
import { AppWideGrayscaleFilter } from './components/AppWideGrayscaleFilter';
import { fontConfig } from './config';
import { SUE_REPORT_VALUES } from './screens';

const RootView = ({ children }: { children: React.ReactNode }) => {
  const [isFontLoaded] = useFonts(fontConfig);
  const { isGrayscaleEnabled } = useContext(AccessibilityContext);
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

  if (!isFontLoaded) return null;

  return (
    <View style={styles.flex} onLayout={onLayoutRootView}>
      <AppWideGrayscaleFilter isGrayscaleEnabled={isGrayscaleEnabled}>
        {children}
      </AppWideGrayscaleFilter>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});

export default RootView;
