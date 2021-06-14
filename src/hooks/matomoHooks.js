import { useMatomo } from 'matomo-tracker-react-native';
import { useContext, useEffect } from 'react';
import { Alert } from 'react-native';

import { texts } from '../config';
import { createMatomoUserId, setMatomoHandledOnStartup, storageHelper } from '../helpers';
import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';

/**
 * Tracks screen view as action with prefixed 'Screen' category on mounting the component, which
 * uses this hook. Track only, if network is connected.
 *
 * @param {String} name - The title of the action being tracked. It is possible to use slashes /
 *                        to set one or several categories for this action. For example, Help /
 *                        Feedback will create the Action Feedback in the category Help.
 */
export const useMatomoTrackScreenView = (name) => {
  const { isConnected } = useContext(NetworkContext);
  const { trackScreenView } = useMatomo();

  useEffect(() => {
    isConnected && trackScreenView(name);
  }, []);
};

export const useMatomoAlertOnStartUp = () => {
  const { globalSettings } = useContext(SettingsContext);

  useEffect(() => {
    const showMatomoAlert = async () => {
      const settings = await storageHelper.matomoSettings();

      if (!settings?.matomoHandledOnStartup) {
        Alert.alert(
          texts.settingsTitles.analytics,
          texts.settingsContents.analytics.onActivate,
          [
            {
              text: texts.settingsContents.analytics.no,
              style: 'cancel'
            },
            {
              text: texts.settingsContents.analytics.yes,
              onPress: createMatomoUserId
            }
          ],
          { cancelable: false }
        );

        setMatomoHandledOnStartup();
      }
    };

    !!globalSettings?.settings?.matomo && showMatomoAlert();
  }, []);
};
