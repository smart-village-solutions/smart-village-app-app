import MatomoTracker, { MatomoProvider } from 'matomo-tracker-react-native';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { namespace, secrets } from './config';
import { matomoSettings } from './helpers';
import { useUserInfoAsync } from './hooks';

export const CustomMatomoProvider = ({ children }) => {
  const [matomoInstance, setMatomoInstance] = useState();
  const getUserInfo = useUserInfoAsync();

  useEffect(() => {
    matomoSettings()
      .then((settings) => {
        const instance = new MatomoTracker({
          urlBase: secrets[namespace]?.matomoUrl,
          siteId: secrets[namespace]?.matomoSiteId,
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
  }, []);

  if (!matomoInstance) return null;

  return <MatomoProvider instance={matomoInstance}>{children}</MatomoProvider>;
};

CustomMatomoProvider.propTypes = {
  children: PropTypes.node
};
