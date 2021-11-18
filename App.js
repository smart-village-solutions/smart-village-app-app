import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useMatomo } from 'matomo-tracker-react-native';
import React, { useCallback, useEffect, useState } from 'react';

import { MainApp } from './src';
import { fontConfig } from './src/config';
import { useUserInfoAsync } from './src/hooks';

const App = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const { trackAppStart } = useMatomo(); // TODO: move app start track inside of matomo provider again
  const userInfoAsync = useUserInfoAsync();

  const trackAppStartAsync = useCallback(async () => {
    const userInfo = await userInfoAsync();

    trackAppStart({ userInfo });
  }, [userInfoAsync]);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    trackAppStartAsync();

    Font.loadAsync(fontConfig)
      .catch((error) => console.warn('An error occurred with loading the fonts', error))
      .finally(() => setFontLoaded(true));
  }, []);

  return fontLoaded ? <MainApp /> : null;
};

export default App;
