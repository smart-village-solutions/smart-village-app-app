import * as Sentry from '@sentry/react-native';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { expo as appConfig } from './app.json';
import { buildSentryAppTags } from './src/helpers/sentryAppContext';
import { MainApp } from './src';
import { auth } from './src/auth';
import { namespace, secrets } from './src/config';

const sentryApi = secrets[namespace]?.sentryApi;

if (sentryApi?.dsn) {
  Sentry.init({
    dsn: sentryApi.dsn,
    enabled: !__DEV__, // NOTE: Sentry will be enabled only in production by default
    environment: sentryApi.environment,
    initialScope: {
      tags: buildSentryAppTags({
        applicationId: Application.applicationId,
        slug: appConfig.slug,
        channel: Updates.channel,
        runtimeVersion: Updates.runtimeVersion,
        updateId: Updates.updateId,
        isEmbeddedLaunch: Updates.isEmbeddedLaunch
      })
    }
    // debug: __DEV__ // NOTE: If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event.
  });
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // runs auth() if app returns from background or inactive to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        auth().catch((error) => console.warn('Unable to refresh app authentication', error));
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView>
      <MainApp />
    </GestureHandlerRootView>
  );
};

export default Sentry.wrap(App);
