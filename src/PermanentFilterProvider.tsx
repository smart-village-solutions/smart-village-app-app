import { noop } from 'lodash';
import React, { createContext, useCallback, useEffect, useReducer } from 'react';

import { readFromStore } from './helpers';
import {
  DATA_PROVIDER_FILTER_KEY,
  MOWAS_REGIONAL_KEYS,
  MowasRegionalKeysAction,
  MowasRegionalKeysActions,
  mowasRegionalKeysReducer,
  PermanentFilterAction,
  PermanentFilterActions,
  permanentFilterReducer,
  RESOURCE_FILTERS_KEY,
  ResourceFiltersAction,
  ResourceFiltersActions,
  resourceFiltersReducer
} from './reducers';

type PermanentFilterProviderValues = {
  dataProviderDispatch: React.Dispatch<PermanentFilterAction>;
  dataProviderState: string[];
  mowasRegionalKeysDispatch: React.Dispatch<MowasRegionalKeysAction>;
  mowasRegionalKeysState: string[];
  resourceFiltersDispatch: React.Dispatch<ResourceFiltersAction>;
  resourceFiltersState: { [key: string]: any };
};

export const PermanentFilterContext = createContext<PermanentFilterProviderValues>({
  dataProviderDispatch: noop,
  dataProviderState: [],
  mowasRegionalKeysDispatch: noop,
  mowasRegionalKeysState: [],
  resourceFiltersDispatch: noop,
  resourceFiltersState: []
});

export const PermanentFilterProvider = ({ children }: { children?: React.ReactNode }) => {
  const [dataProviderState, dataProviderDispatch] = useReducer(permanentFilterReducer, []);
  const [mowasRegionalKeysState, mowasRegionalKeysDispatch] = useReducer(
    mowasRegionalKeysReducer,
    []
  );
  const [resourceFiltersState, resourceFiltersDispatch] = useReducer(resourceFiltersReducer, []);

  const loadFilters = useCallback(async () => {
    const dataProviderIds = ((await readFromStore(DATA_PROVIDER_FILTER_KEY)) ?? []) as string[];
    const mowasRegionalKeys = ((await readFromStore(MOWAS_REGIONAL_KEYS)) ?? []) as string[];
    const resourceFilters = ((await readFromStore(RESOURCE_FILTERS_KEY)) ?? []) as string[];

    dataProviderDispatch({
      type: PermanentFilterActions.OverwriteDataProviders,
      payload: dataProviderIds
    });
    mowasRegionalKeysDispatch({
      type: MowasRegionalKeysActions.OverwriteMowasRegionalKeys,
      payload: mowasRegionalKeys
    });
    resourceFiltersDispatch({
      type: ResourceFiltersActions.OverwriteResourceFilters,
      payload: resourceFilters
    });
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  return (
    <PermanentFilterContext.Provider
      value={{
        dataProviderDispatch,
        dataProviderState,
        mowasRegionalKeysDispatch,
        mowasRegionalKeysState,
        resourceFiltersDispatch,
        resourceFiltersState
      }}
    >
      {children}
    </PermanentFilterContext.Provider>
  );
};
