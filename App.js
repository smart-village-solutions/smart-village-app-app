import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import MatomoTracker, { MatomoProvider, useMatomo } from 'matomo-tracker-react-native';

import { MainApp } from './src';
import { fontConfig, namespace, secrets } from './src/config';
import { matomoSettings } from './src/helpers';

const AppWithFonts = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const { trackAppStart } = useMatomo();

  useEffect(() => {
    trackAppStart();

    Font.loadAsync(fontConfig)
      .catch((error) => console.warn('An error occurred with loading the fonts', error))
      .finally(() => setFontLoaded(true));
  }, []);

  return fontLoaded ? <MainApp /> : null;
};

const App = () => {
  const [matomoInstance, setMatomoInstance] = useState();

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    matomoSettings()
      .then((settings) =>
        setMatomoInstance(
          new MatomoTracker({
            urlBase: secrets[namespace]?.matomoUrl,
            siteId: secrets[namespace]?.matomoSiteId,
            userId: settings?.userId,
            disabled: !settings?.consent || __DEV__,
            log: __DEV__
          })
        )
      )
      .catch((error) => {
        console.warn('An error occurred with setup Matomo tracking', error);
        setMatomoInstance({ error: true });
      });
  }, []);

  if (!matomoInstance) return null;
  if (matomoInstance && matomoInstance.error) return <AppWithFonts />;

  return (
    <MatomoProvider instance={matomoInstance}>
      <AppWithFonts />
    </MatomoProvider>
  );
};

export default App;
