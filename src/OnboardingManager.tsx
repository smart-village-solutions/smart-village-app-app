import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useContext, useEffect, useState } from 'react';

import { CustomMatomoProvider } from './CustomMatomoProvider';
import { Initializer, Initializers } from './helpers/initializationHelper';
import { addToStore, readFromStore } from './helpers/storageHelper';
import RootView from './RootView';
import { AppIntroScreen } from './screens/AppIntroScreen';
import { SettingsContext } from './SettingsProvider';

export const ONBOARDING_STORE_KEY = 'ONBOARDING_STORE_KEY';
export const TERMS_AND_CONDITIONS_STORE_KEY = 'TERMS_AND_CONDITIONS_STORE_KEY';
export const HAS_TERMS_AND_CONDITIONS_STORE_KEY = 'HAS_TERMS_AND_CONDITIONS_STORE_KEY';

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
    } else {
      // lock to portrait during onboarding
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
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
        setTermsAndConditionsStatus('accepted');

        console.error(e);
      }
    };

    if (onboardingActive) {
      loadAndSetOnboardingStatus();
    } else {
      setOnboardingStatus('complete');
      setTermsAndConditionsStatus('accepted');
    }
  }, []);

  useInitializeAfterOnboarding(onboardingStatus === 'complete');

  let content: React.ReactNode = null;

  // Keep RootView mounted while onboarding status is loading from AsyncStorage.
  // Its themed background also remains visible while the main providers initialize.
  if (
    onboardingStatus === 'loading' ||
    (onboardingStatus === 'complete' && termsAndConditionsStatus === 'unknown')
  ) {
    content = null;
  } else if (onboardingStatus === 'incomplete') {
    content = <AppIntroScreen setOnboardingComplete={setOnboardingComplete} />;
  } else if (termsAndConditionsStatus === 'declined') {
    content = (
      <AppIntroScreen
        setOnboardingComplete={setTermsAndConditionsAccepted}
        onlyTermsAndConditions
      />
    );
  } else {
    content = <CustomMatomoProvider>{children}</CustomMatomoProvider>;
  }

  return <RootView>{content}</RootView>;
};
