import { noop } from 'lodash';
import React, { createContext, useCallback, useEffect, useReducer } from 'react';

import { readFromStore } from './helpers';
import { DATA_PROVIDER_FILTER_KEY, permanentFilterReducer } from './reducers';
import { FilterAction, FilterReducerAction } from './types';

type PermanentFilterProviderValues = {
  state: string[];
  dispatch: React.Dispatch<FilterReducerAction>;
};

export const PermanentFilterContext = createContext<PermanentFilterProviderValues>({
  dispatch: noop,
  state: []
});

export const PermanentFilterProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, dispatch] = useReducer(permanentFilterReducer, []);

  const loadFilters = useCallback(async () => {
    const dataProviderIds = ((await readFromStore(DATA_PROVIDER_FILTER_KEY)) ?? []) as string[];

    dispatch({ type: FilterAction.OverwriteDataProviders, payload: dataProviderIds });
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  return (
    <PermanentFilterContext.Provider value={{ dispatch, state }}>
      {children}
    </PermanentFilterContext.Provider>
  );
};
