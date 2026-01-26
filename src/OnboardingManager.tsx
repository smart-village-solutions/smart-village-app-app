import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import React, { useContext, useEffect, useState } from 'react';

import { CustomMatomoProvider } from './CustomMatomoProvider';
import { Initializer, Initializers } from './helpers/initializationHelper';
import { addToStore, readFromStore } from './helpers/storageHelper';
import { AppIntroScreen } from './screens/AppIntroScreen';
import { SettingsContext } from './SettingsProvider';

/**
 * AsyncStorage key that marks whether the onboarding carousel finished successfully.
 */
export const ONBOARDING_STORE_KEY = 'ONBOARDING_STORE_KEY';
/**
 * AsyncStorage key that notes if the user already accepted the terms and conditions.
 */
export const TERMS_AND_CONDITIONS_STORE_KEY = 'TERMS_AND_CONDITIONS_STORE_KEY';
/**
 * Legacy flag indicating whether any terms and conditions were ever stored for the device.
 */
export const HAS_TERMS_AND_CONDITIONS_STORE_KEY = 'HAS_TERMS_AND_CONDITIONS_STORE_KEY';

/**
 * Initializes system services that normally start during onboarding but might have been skipped
 * when onboarding ran without the necessary settings in place.
 *
 * @param onboardingComplete Whether onboarding has been marked as completed on this device.
 */
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

/**
 * Wraps the app in onboarding and terms-and-conditions gating so that the main UI only renders
 * after the correct onboarding flow (full onboarding or just T&C confirmation) has finished.
 */
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
      setTermsAndConditionsStatus('accepted');
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
