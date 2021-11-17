import * as SplashScreen from 'expo-splash-screen';
import React, { useContext, useEffect, useState } from 'react';

import { addToStore, readFromStore } from './helpers';
import { Initializer, Initializers } from './helpers/initializationHelper';
import { AppIntroScreen } from './screens';
import { SettingsContext } from './SettingsProvider';

const ONBOARDING_STORE_KEY = 'ONBOARDING_STORE_KEY';

export const OnboardingManager = ({ children }: { children: React.ReactNode }) => {
  const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'complete' | 'incomplete'>(
    'loading'
  );
  const {
    globalSettings: {
      // @ts-expect-error settings context is not properly typed
      settings: {
        locationService: locationServiceActive,
        onboarding: onboardingActive,
        pushNotifications: pushNotificationsActive
      }
    }
  } = useContext(SettingsContext);

  const setOnboardingComplete = () => {
    setOnboardingStatus('complete');

    addToStore(ONBOARDING_STORE_KEY, 'complete');
  };

  useEffect(() => {
    const loadAndSetOnboardingStatus = async () => {
      try {
        const onboardingComplete = await readFromStore(ONBOARDING_STORE_KEY);

        if (onboardingComplete === 'complete') {
          setOnboardingStatus('complete');
        } else {
          setOnboardingStatus('incomplete');
        }
      } catch (e) {
        setOnboardingStatus('complete');

        console.error(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    if (onboardingActive) {
      loadAndSetOnboardingStatus();
    } else {
      setOnboardingStatus('complete');
      SplashScreen.hideAsync();
    }
  }, []);

  // this effect ensures that all settings will be properly initialized, even when onboarding was completed before the settings where available, or an error occured
  useEffect(() => {
    if (onboardingStatus === 'complete') {
      // TODO: add matomo
      if (locationServiceActive) {
        Initializers[Initializer.LocationService]();
      }
      if (pushNotificationsActive) {
        Initializers[Initializer.PushNotifications]();
      }
    }
  }, [onboardingStatus]);

  // render null while onboarding status is loading from AsyncStorage
  if (onboardingStatus === 'loading') {
    return null;
  }

  if (onboardingStatus === 'incomplete') {
    return <AppIntroScreen setOnboardingComplete={setOnboardingComplete} />;
  }

  // TODO: move matomo provider  here
  return <>{children}</>;
};
