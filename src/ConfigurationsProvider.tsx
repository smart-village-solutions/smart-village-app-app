import React, { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery as useQueryWithApollo } from 'react-apollo';
import { useQuery } from 'react-query';

import { SettingsContext } from './SettingsProvider';
import {
  defaultAppDesignSystemConfig,
  defaultResourceFilterConfig
} from './config/appDesignSystem';
import { defaultSueAppConfig } from './config/sue';
import { storageHelper } from './helpers';
import { useStaticContent } from './hooks';
import { QUERY_TYPES, getQuery } from './queries';
import { GenericType } from './types';

const FILTER_QUERY_TYPES = {
  'GenericItem::ConstructionSite': GenericType.ConstructionSite,
  'GenericItem::Deadline': GenericType.Deadline,
  'GenericItem::DefectReport': GenericType.DefectReport,
  'GenericItem::Job': GenericType.Job,
  'GenericItem::Noticeboard': GenericType.Noticeboard,
  'GenericItem::Offer': GenericType.Commercial,
  EventRecord: QUERY_TYPES.EVENT_RECORDS,
  NewsItem: QUERY_TYPES.NEWS_ITEMS,
  PointOfInterest: QUERY_TYPES.POINTS_OF_INTEREST,
  Tour: QUERY_TYPES.TOURS
};

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
  resourceFilters: defaultResourceFilterConfig,
  sueConfig: defaultSueAppConfig
};

export const ConfigurationsContext = createContext(defaultConfiguration);

export const ConfigurationsProvider = ({ children }: { children?: ReactNode }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings, appDesignSystem = {} } = globalSettings;
  const { sue = {}, showResourceFilters = false } = settings || {};

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

  const { data: resourceFilterData } = useQueryWithApollo(getQuery(QUERY_TYPES.RESOURCE_FILTERS), {
    skip: !showResourceFilters
  });

  const mergedConfig = useMemo(() => {
    if (!Object.keys(sue).length || !showResourceFilters) {
      return defaultConfiguration;
    }

    const resourceFilters = resourceFilterData?.resourceFilters?.map((resourceFilter: any) => ({
      ...resourceFilter,
      dataResourceType: FILTER_QUERY_TYPES[resourceFilter.dataResourceType]
    }));

    return mergeDefaultConfiguration(defaultConfiguration, {
      appDesignSystem,
      resourceFilters,
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
