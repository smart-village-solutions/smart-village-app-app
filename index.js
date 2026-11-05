import 'expo-dev-client';
import 'react-native-reanimated';
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';

import { initializeTextsLocale } from './src/helpers/textsLocaleHelper';

SplashScreen.preventAutoHideAsync();

const AppBootstrap = () => {
  const [App, setApp] = useState(null);

  useEffect(() => {
    initializeTextsLocale().then(() => {
      // Load App modules only after selecting texts, including module-level labels.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      setApp(() => require('./App').default);
    });
  }, []);

  return App ? <App /> : null;
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(AppBootstrap);
