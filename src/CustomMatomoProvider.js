import MatomoTracker, { MatomoProvider } from 'matomo-tracker-react-native';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';

import { matomoSettings } from './helpers';
import { useUserInfoAsync } from './hooks';
import { SettingsContext } from './SettingsProvider';

/**
 * Initializes Matomo tracking with runtime settings/consent and exposes the tracker via context.
 */
export const CustomMatomoProvider = ({ children }) => {
  const [matomoInstance, setMatomoInstance] = useState();
  const getUserInfo = useUserInfoAsync();
  const { globalSettings } = useContext(SettingsContext);
  const urlBase = globalSettings?.settings?.matomo?.urlBase;
  const siteId = globalSettings?.settings?.matomo?.siteId;

  useEffect(() => {
    if (urlBase && siteId) {
      matomoSettings()
        .then((settings) => {
          const instance = new MatomoTracker({
            urlBase,
            siteId,
            userId: settings?.userId,
            disabled: !settings?.consent || __DEV__,
            log: __DEV__
          });

          getUserInfo().then((userInfo) => instance.trackAppStart(userInfo));
          setMatomoInstance(instance);
        })
        .catch((error) => {
          console.warn('An error occurred with setup Matomo tracking', error);
          setMatomoInstance({});
        });
    } else {
      setMatomoInstance({});
    }
  }, []);

  if (!matomoInstance) return null;

  return <MatomoProvider instance={matomoInstance}>{children}</MatomoProvider>;
};

CustomMatomoProvider.propTypes = {
  children: PropTypes.node
};
