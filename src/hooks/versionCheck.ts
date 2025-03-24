import { checkForUpdate, startUpdate } from 'expo-in-app-updates';
import { useContext, useEffect } from 'react';
import { Alert } from 'react-native';

import { SettingsContext } from '../SettingsProvider';
import { texts } from '../config';

export const useVersionCheck = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { versionCheckEnabled = {} } = settings;
  const {
    alertMessage = texts.updateAlert.updateMessage,
    alertTitle = texts.updateAlert.updateTitle,
    enabled = false,
    isRequired = false,
    requiredAlertMessage = texts.updateAlert.updateRequiredMessage,
    requiredAlertTitle = texts.updateAlert.updateRequiredTitle
  } = versionCheckEnabled;

  if (!enabled) return;

  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        const { updateAvailable } = await checkForUpdate();

        if (!updateAvailable) return;

        Alert.alert(
          isRequired ? requiredAlertTitle : alertTitle,
          isRequired ? requiredAlertMessage : alertMessage,
          [
            {
              text: texts.updateAlert.updateNow,
              onPress: async () => await startUpdate(isRequired)
            },
            !isRequired && { text: texts.updateAlert.later }
          ]
        );
      } catch (error) {
        // Handle error while checking app version
        console.error('Error checking app version:', error);
      }
    };

    checkAppVersion();
  }, []);
};
