import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import React, { useContext, useEffect, useState } from 'react';

import { CustomMatomoProvider } from './CustomMatomoProvider';
import { addToStore, readFromStore } from './helpers';
import { Initializer, Initializers } from './helpers/initializationHelper';
import { AppIntroScreen } from './screens';
import { SettingsContext } from './SettingsProvider';

const ONBOARDING_STORE_KEY = 'ONBOARDING_STORE_KEY';

// this hook ensures that all settings will be properly initialized, even when onboarding was completed before the settings where available, or an error occured
const useInitializeAfterOnboarding = (onboardingComplete: boolean) => {
  const {
    globalSettings: {
      // @ts-expect-error settings context is not properly typed
      settings: {
        locationService: locationServiceActive,
        pushNotifications: pushNotificationsActive,
        matomo: matomoActive
      }
    }
  } = useContext(SettingsContext);

  // this effect ensures that all settings will be properly initialized, even when onboarding was completed before the settings where available, or an error occured
  useEffect(() => {
    if (onboardingComplete) {
      if (locationServiceActive) {
        Initializers[Initializer.LocationService]();
      }
      if (matomoActive) {
        Initializers[Initializer.MatomoTracking]();
      }
      if (pushNotificationsActive) {
        Initializers[Initializer.PushNotifications]();
      }

      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    }
  }, [onboardingComplete]);
};

export const OnboardingManager = ({ children }: { children: React.ReactNode }) => {
  const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'complete' | 'incomplete'>(
    'loading'
  );
  const {
    globalSettings: {
      // @ts-expect-error settings context is not properly typed
      settings: { onboarding: onboardingActive }
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

  useInitializeAfterOnboarding(onboardingStatus === 'complete');

  // render null while onboarding status is loading from AsyncStorage
  if (onboardingStatus === 'loading') {
    return null;
  }

  if (onboardingStatus === 'incomplete') {
    return <AppIntroScreen setOnboardingComplete={setOnboardingComplete} />;
  }

  return <CustomMatomoProvider>{children}</CustomMatomoProvider>;
};
