import MapLibreGL from '@maplibre/maplibre-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { MainApp } from './src';
import { auth } from './src/auth';
import { fontConfig, namespace, secrets } from './src/config';
import { SUE_REPORT_VALUES } from './src/screens';

MapLibreGL.setAccessToken(null);
const sentryApi = secrets[namespace].sentryApi;

if (sentryApi?.dsn) {
  Sentry.init({
    dsn: sentryApi.dsn,
    enableNative: true, // NOTE: Native crash reporting is not available with the classic build system (expo build:[ios|android]), but is available via EAS Build.
    // enableInExpoDevelopment: true, // NOTE: Use this to enable temporarily tracking errors in development
    debug: __DEV__ // NOTE: If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  });
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App = () => {
  const appState = useRef(AppState.currentState);
  const [isFontLoaded, setIsFontLoaded] = useState(false);

  useEffect(() => {
    // runs auth() if app returns from background or inactive to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        auth();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync(fontConfig);
      } catch (error) {
        console.warn(error);
      } finally {
        setIsFontLoaded(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isFontLoaded) {
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
    <GestureHandlerRootView style={styles.flex} onLayout={onLayoutRootView}>
      <MainApp />
    </GestureHandlerRootView>
  );
};

export default Sentry.wrap(App);

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});
