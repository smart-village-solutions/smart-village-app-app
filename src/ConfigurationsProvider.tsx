import React, { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
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
    type: 'json',
    skip: !Object.keys(sue).length
  });

  const mergedConfig = useMemo(() => {
    if (!Object.keys(sue).length) {
      return defaultConfiguration;
    }

    return mergeDefaultConfiguration(defaultConfiguration, {
      appDesignSystem,
      sueConfig: { ...sue, ...sueConfigData, sueProgress }
    });
  }, [appDesignSystem, sue, sueConfigData, sueProgress]);

  useEffect(() => {
    setConfigurations(mergedConfig);
    storageHelper.setConfigurations(mergedConfig);
  }, [mergedConfig]);

  return (
    <ConfigurationsContext.Provider value={configurations}>
      {children}
    </ConfigurationsContext.Provider>
  );
};
