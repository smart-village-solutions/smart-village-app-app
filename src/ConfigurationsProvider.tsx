import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import { SettingsContext } from './SettingsProvider';
import { useStaticContent } from './hooks';
import { QUERY_TYPES, getQuery } from './queries';
import { storageHelper } from './helpers';
import { defaultAppDesignSystemConfig } from './config/appDesignSystem';
import { defaultSueAppConfig } from './config/sue';

const mergeDefaultConfiguration = (target: any, source: any) => {
  for (const key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) {
        target[key] = {};
      }
      mergeDefaultConfiguration(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

const defaultConfiguration = {
  appDesignSystem: defaultAppDesignSystemConfig,
  sueConfig: defaultSueAppConfig
};

export const ConfigurationsContext = createContext(defaultConfiguration);

export const ConfigurationsProvider = ({ children }: { children?: ReactNode }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings, appDesignSystem = {} } = globalSettings;
  const { sue = {} } = settings || {};

  const [configurations, setConfigurations] = useState(defaultConfiguration);

  const { data: sueConfigData } = useQuery(
    [QUERY_TYPES.SUE.CONFIGURATIONS],
    () => getQuery(QUERY_TYPES.SUE.CONFIGURATIONS)(),
    { enabled: !!Object.keys(sue).length }
  );

  const { data: sueProgress } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-sueReportProgress',
    name: 'sueReportProgress',
    type: 'json'
  });

  useEffect(() => {
    const config = {
      appDesignSystem,
      sueConfig: { ...sue, ...sueConfigData, sueProgress }
    };

    setConfigurations((prev) => mergeDefaultConfiguration(prev, config));
    storageHelper.setConfigurations(config);
  }, [sueConfigData]);

  return (
    <ConfigurationsContext.Provider value={configurations}>
      {children}
    </ConfigurationsContext.Provider>
  );
};
