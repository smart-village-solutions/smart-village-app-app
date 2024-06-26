import { useContext, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import VersionCheck from 'react-native-version-check-expo';

import appJson from '../../app.json';
import { SettingsContext } from '../SettingsProvider';
import { device, texts } from '../config';

const bundleIdentifier = appJson.expo.ios.bundleIdentifier;
const packageName = appJson.expo.android.package;

export const useVersionCheck = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { versionCheckEnabled } = settings;

  if (!versionCheckEnabled) return;

  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        const storeVersion = await VersionCheck.getLatestVersion({
          provider: device.platform === 'ios' ? 'appStore' : 'playStore',
          packageName: device.platform === 'ios' ? bundleIdentifier : packageName,
          ignoreErrors: true
        });

        const currentVersion = await VersionCheck.getCurrentVersion();

        if (!storeVersion || !currentVersion) return;

        if (storeVersion > currentVersion) {
          const appStoreUrl = await VersionCheck.getAppStoreUrl({ appID: bundleIdentifier });
          const playStoreUrl = await VersionCheck.getPlayStoreUrl({ appID: packageName });

          Alert.alert(
            texts.updateAlert.updateRequiredTitle,
            texts.updateAlert.updateRequiredMessage,
            [
              {
                text: texts.updateAlert.updateNow,
                onPress: () => {
                  Linking.openURL(device.platform === 'ios' ? appStoreUrl : playStoreUrl);
                }
              }
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        // Handle error while checking app version
        console.error('Error checking app version:', error);
      }
    };

    checkAppVersion();
  }, []);
};
