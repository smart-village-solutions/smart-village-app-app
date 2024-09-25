import { noop } from 'lodash';
import React, { createContext, useCallback, useEffect, useReducer } from 'react';

import { readFromStore, storageHelper } from './helpers';
import {
  DATA_PROVIDER_FILTER_KEY,
  FilterAction,
  FilterReducerAction,
  MOWAS_REGIONAL_KEYS,
  MowasFilterAction,
  MowasFilterReducerAction,
  mowasRegionalKeysReducer,
  permanentFilterReducer,
  RESOURCE_FILTER_KEY,
  ResourceFilterAction,
  resourceFilterReducer,
  ResourceFilterReducerAction
} from './reducers';

type PermanentFilterProviderValues = {
  dataProviderDispatch: React.Dispatch<FilterReducerAction>;
  dataProviderState: string[];
  mowasRegionalKeysDispatch: React.Dispatch<MowasFilterReducerAction>;
  mowasRegionalKeysState: string[];
  resourceFilterDispatch: React.Dispatch<ResourceFilterReducerAction>;
  resourceFilterState: string[];
};

export const PermanentFilterContext = createContext<PermanentFilterProviderValues>({
  dataProviderDispatch: noop,
  dataProviderState: [],
  mowasRegionalKeysDispatch: noop,
  mowasRegionalKeysState: [],
  resourceFilterDispatch: noop,
  resourceFilterState: []
});

export const PermanentFilterProvider = ({ children }: { children?: React.ReactNode }) => {
  const [dataProviderState, dataProviderDispatch] = useReducer(permanentFilterReducer, []);
  const [mowasRegionalKeysState, mowasRegionalKeysDispatch] = useReducer(
    mowasRegionalKeysReducer,
    []
  );
  const [resourceFilterState, resourceFilterDispatch] = useReducer(resourceFilterReducer, []);

  const loadFilters = useCallback(async () => {
    const dataProviderIds = ((await readFromStore(DATA_PROVIDER_FILTER_KEY)) ?? []) as string[];
    const mowasRegionalKeys = ((await readFromStore(MOWAS_REGIONAL_KEYS)) ?? []) as string[];
    const resourceFilter = ((await readFromStore(RESOURCE_FILTER_KEY)) ?? []) as string[];

    dataProviderDispatch({ type: FilterAction.OverwriteDataProviders, payload: dataProviderIds });
    mowasRegionalKeysDispatch({
      type: MowasFilterAction.OverwriteMowasRegionalKeys,
      payload: mowasRegionalKeys
    });
    resourceFilterDispatch({
      type: ResourceFilterAction.OverwriteResourceFilter,
      payload: resourceFilter
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
        resourceFilterDispatch,
        resourceFilterState
      }}
    >
      {children}
    </PermanentFilterContext.Provider>
  );
};
