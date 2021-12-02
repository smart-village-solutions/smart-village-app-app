import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';

import { MainApp } from './src';
import { fontConfig } from './src/config';

const App = () => {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    Font.loadAsync(fontConfig)
      .catch((error) => console.warn('An error occurred with loading the fonts', error))
      .finally(() => setFontLoaded(true));
  }, []);

  return fontLoaded ? <MainApp /> : null;
};

export default App;
