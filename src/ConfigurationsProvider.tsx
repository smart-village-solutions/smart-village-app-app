import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import { SettingsContext } from './SettingsProvider';
import { defaultAppDesignSystemConfig, defaultSueAppConfig } from './config/configurations';
import { useStaticContent } from './hooks';
import { QUERY_TYPES, getQuery } from './queries';

const defaultConfiguration = {
};

export const ConfigurationsContext = createContext(defaultConfiguration);

export const ConfigurationsProvider = ({ children }: { children?: ReactNode }) => {
  const [configurations, setConfigurations] = useState(defaultConfiguration);

  useEffect(() => {
    const config = {
    };

    setConfigurations(config);
  }, [sueConfigData, appDesignSystem]);

  return (
    <ConfigurationsContext.Provider value={configurations}>
      {children}
    </ConfigurationsContext.Provider>
  );
};
