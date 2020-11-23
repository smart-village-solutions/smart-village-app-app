import { useContext, useEffect } from 'react';
import { useMatomo } from 'matomo-tracker-react-native';

import { NetworkContext } from '../NetworkProvider';

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
