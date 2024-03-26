import { noop } from 'lodash';
import React, { createContext, useCallback, useEffect, useReducer } from 'react';

import { readFromStore } from './helpers';
import {
  DATA_PROVIDER_FILTER_KEY,
  MOWAS_REGIONAL_KEYS,
  MowasFilterAction,
  MowasFilterReducerAction,
  mowasRegionalKeysReducer,
  permanentFilterReducer
} from './reducers';
import { FilterAction, FilterReducerAction } from './types';

type PermanentFilterProviderValues = {
  dataProviderState: string[];
  dataProviderDispatch: React.Dispatch<FilterReducerAction>;
  mowasRegionalKeysState: string[];
  mowasRegionalKeysDispatch: React.Dispatch<MowasFilterReducerAction>;
};

export const PermanentFilterContext = createContext<PermanentFilterProviderValues>({
  dataProviderState: [],
  dataProviderDispatch: noop,
  mowasRegionalKeysState: [],
  mowasRegionalKeysDispatch: noop
});

export const PermanentFilterProvider = ({ children }: { children?: React.ReactNode }) => {
  const [dataProviderState, dataProviderDispatch] = useReducer(permanentFilterReducer, []);
  const [mowasRegionalKeysState, mowasRegionalKeysDispatch] = useReducer(
    mowasRegionalKeysReducer,
    []
  );

  const loadFilters = useCallback(async () => {
    const dataProviderIds = ((await readFromStore(DATA_PROVIDER_FILTER_KEY)) ?? []) as string[];
    const mowasRegionalKeys = ((await readFromStore(MOWAS_REGIONAL_KEYS)) ?? []) as string[];

    dataProviderDispatch({ type: FilterAction.OverwriteDataProviders, payload: dataProviderIds });
    mowasRegionalKeysDispatch({
      type: MowasFilterAction.OverwriteMowasRegionalKeys,
      payload: mowasRegionalKeys
    });
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  return (
    <PermanentFilterContext.Provider
      value={{
        dataProviderState,
        dataProviderDispatch,
        mowasRegionalKeysState,
        mowasRegionalKeysDispatch
      }}
    >
      {children}
    </PermanentFilterContext.Provider>
  );
};
