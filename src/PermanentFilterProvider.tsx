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
  OverlayFilterAction,
  overlayFilterReducer,
  OverlayFilterReducerAction,
  permanentFilterReducer
} from './reducers';

type PermanentFilterProviderValues = {
  dataProviderDispatch: React.Dispatch<FilterReducerAction>;
  dataProviderState: string[];
  mowasRegionalKeysDispatch: React.Dispatch<MowasFilterReducerAction>;
  mowasRegionalKeysState: string[];
  filterDispatch: React.Dispatch<OverlayFilterReducerAction>;
  filterState: string[];
};

export const PermanentFilterContext = createContext<PermanentFilterProviderValues>({
  dataProviderState: [],
  dataProviderDispatch: noop,
  mowasRegionalKeysState: [],
  mowasRegionalKeysDispatch: noop,
  filterState: [],
  filterDispatch: noop
});

export const PermanentFilterProvider = ({ children }: { children?: React.ReactNode }) => {
  const [dataProviderState, dataProviderDispatch] = useReducer(permanentFilterReducer, []);
  const [mowasRegionalKeysState, mowasRegionalKeysDispatch] = useReducer(
    mowasRegionalKeysReducer,
    []
  );
  const [filterState, filterDispatch] = useReducer(overlayFilterReducer, []);

  const loadFilters = useCallback(async () => {
    const dataProviderIds = ((await readFromStore(DATA_PROVIDER_FILTER_KEY)) ?? []) as string[];
    const mowasRegionalKeys = ((await readFromStore(MOWAS_REGIONAL_KEYS)) ?? []) as string[];
    const overlayFilter = ((await storageHelper.filter()) ?? []) as string[];

    dataProviderDispatch({ type: FilterAction.OverwriteDataProviders, payload: dataProviderIds });
    mowasRegionalKeysDispatch({
      type: MowasFilterAction.OverwriteMowasRegionalKeys,
      payload: mowasRegionalKeys
    });
    filterDispatch({ type: OverlayFilterAction.OverwriteFilter, payload: overlayFilter });
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
        filterDispatch,
        filterState
      }}
    >
      {children}
    </PermanentFilterContext.Provider>
  );
};
