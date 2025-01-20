import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import React, { useContext, useEffect, useState } from 'react';

import { CustomMatomoProvider } from './CustomMatomoProvider';
import { Initializer, Initializers } from './helpers/initializationHelper';
import { addToStore, readFromStore } from './helpers/storageHelper';
import { AppIntroScreen } from './screens/AppIntroScreen';
import { SettingsContext } from './SettingsProvider';

export const ONBOARDING_STORE_KEY = 'ONBOARDING_STORE_KEY';
export const TERMS_AND_CONDITIONS_STORE_KEY = 'TERMS_AND_CONDITIONS_STORE_KEY';

// this hook ensures that all settings will be properly initialized, even when onboarding
// was completed before the settings where available, or an error occurred
const useInitializeAfterOnboarding = (onboardingComplete: boolean) => {
  const {
    globalSettings: {
      settings: {
        // @ts-expect-error settings context is not properly typed
        locationService: locationServiceActive,
        // @ts-expect-error settings context is not properly typed
        pushNotifications: pushNotificationsActive,
        // @ts-expect-error settings context is not properly typed
        matomo: matomoActive
      }
    }
  } = useContext(SettingsContext);

  // this effect ensures that all settings will be properly initialized, even when onboarding
  // was completed before the settings where available, or an error occurred
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

      // set orientation to "default", to allow both portrait and landscape
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    }
  }, [onboardingComplete]);
};

export const OnboardingManager = ({ children }: { children: React.ReactNode }) => {
  const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'complete' | 'incomplete'>(
    'loading'
  );
  const [termsAndConditionsStatus, setTermsAndConditionsStatus] = useState<
    'unknown' | 'accepted' | 'declined'
  >('unknown');
  const {
    globalSettings: {
      settings: {
        // @ts-expect-error settings context is not properly typed
        onboarding: onboardingActive
      }
    }
  } = useContext(SettingsContext);

  const setOnboardingComplete = () => {
    setOnboardingStatus('complete');
    addToStore(ONBOARDING_STORE_KEY, 'complete');
    setTermsAndConditionsAccepted();
  };

  const setTermsAndConditionsAccepted = () => {
    setTermsAndConditionsStatus('accepted');
    addToStore(TERMS_AND_CONDITIONS_STORE_KEY, 'accepted');
  };

  useEffect(() => {
    const loadAndSetOnboardingStatus = async () => {
      try {
        const onboardingComplete = await readFromStore(ONBOARDING_STORE_KEY);
        const termsAndConditionsAccepted = await readFromStore(TERMS_AND_CONDITIONS_STORE_KEY);

        if (onboardingComplete === 'complete') {
          setOnboardingStatus('complete');
        } else {
          setOnboardingStatus('incomplete');
        }

        if (termsAndConditionsAccepted === 'accepted') {
          setTermsAndConditionsStatus('accepted');
        } else {
          setTermsAndConditionsStatus('declined');
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
  if (
    onboardingStatus === 'loading' ||
    (onboardingStatus === 'complete' && termsAndConditionsStatus === 'unknown')
  ) {
    return null;
  }

  if (onboardingStatus === 'incomplete') {
    return <AppIntroScreen setOnboardingComplete={setOnboardingComplete} />;
  }

  if (onboardingStatus === 'complete' && termsAndConditionsStatus === 'declined') {
    return (
      <AppIntroScreen
        setOnboardingComplete={setTermsAndConditionsAccepted}
        onlyTermsAndConditions
      />
    );
  }

  return <CustomMatomoProvider>{children}</CustomMatomoProvider>;
};
