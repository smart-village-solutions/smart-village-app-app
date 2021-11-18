import Constants from 'expo-constants';
import * as Localization from 'expo-localization';
import { useMatomo } from 'matomo-tracker-react-native';
import { useCallback, useContext, useEffect } from 'react';

import appJson from '../../app.json';
import { device } from '../config';
import { NetworkContext } from '../NetworkProvider';

export const useUserInfoAsync = () =>
  useCallback(async () => {
    const ua = await Constants.getWebViewUserAgentAsync();
    const userInfo = {
      _cvar: JSON.stringify({ 1: ['App-Version', appJson.expo.version] }),
      lang: Localization.locale,
      res: `${device.width}x${device.height}`,
      ua
    };

    return userInfo;
  }, []);

export const useTrackScreenViewAsync = () => {
  const { trackScreenView } = useMatomo();
  const userInfoAsync = useUserInfoAsync();

  return useCallback(
    async (name) => {
      const userInfo = await userInfoAsync();

      trackScreenView({ name, userInfo });
    },
    [userInfoAsync]
  );
};

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
  const trackScreenViewAsync = useTrackScreenViewAsync();

  useEffect(() => {
    isConnected && trackScreenViewAsync(name);
  }, []);
};

export const useTrackAppStart = () => {
  const { trackAppStart } = useMatomo();
  const userInfoAsync = useUserInfoAsync();

  const trackAppStartAsync = useCallback(async () => {
    const userInfo = await userInfoAsync();

    trackAppStart({ userInfo });
  }, [userInfoAsync]);

  useEffect(() => {
    trackAppStartAsync();
  }, []);
};
