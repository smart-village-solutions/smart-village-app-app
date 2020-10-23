import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import { MainApp } from './src';

const App = () => {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHide();

    Font.loadAsync({
      'titillium-web-bold': require('./assets/fonts/TitilliumWeb-Bold.ttf'),
      'titillium-web-bold-italic': require('./assets/fonts/TitilliumWeb-BoldItalic.ttf'),
      'titillium-web-regular': require('./assets/fonts/TitilliumWeb-Regular.ttf'),
      'titillium-web-italic': require('./assets/fonts/TitilliumWeb-Italic.ttf'),
      'titillium-web-light': require('./assets/fonts/TitilliumWeb-Light.ttf'),
      'titillium-web-light-italic': require('./assets/fonts/TitilliumWeb-LightItalic.ttf')
    })
      .then(() => setFontLoaded(true))
      .catch((err) => console.warn('An error occurred with loading the fonts', err));
  }, []);

  return fontLoaded ? <MainApp /> : null;
};

export default App;
