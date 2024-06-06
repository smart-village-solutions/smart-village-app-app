import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import { SettingsContext } from './SettingsProvider';
import { defaultAppDesignSystemConfig, defaultSueAppConfig } from './config/configurations';
import { useStaticContent } from './hooks';
import { QUERY_TYPES, getQuery } from './queries';

const defaultConfiguration = {
  appDesignSystem: defaultAppDesignSystemConfig,
  sueConfig: defaultSueAppConfig
};

export const ConfigurationsContext = createContext(defaultConfiguration);

export const ConfigurationsProvider = ({ children }: { children?: ReactNode }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings } = globalSettings;
  const { sue = {} } = settings || {};

  const [configurations, setConfigurations] = useState(defaultConfiguration);

  const { data: sueConfigData } = useQuery(
    [QUERY_TYPES.SUE.CONFIGURATIONS],
    () => getQuery(QUERY_TYPES.SUE.CONFIGURATIONS)(),
    { enabled: !!sue }
  );

  const { data: appDesignSystem } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-appDesignSystem',
    name: 'appDesignSystem',
    type: 'json'
  });

  useEffect(() => {
    const config = {
      appDesignSystem,
      sueConfig: { ...sue, ...sueConfigData }
    };

    setConfigurations(config);
  }, [sueConfigData, appDesignSystem]);

  return (
    <ConfigurationsContext.Provider value={configurations}>
      {children}
    </ConfigurationsContext.Provider>
  );
};
