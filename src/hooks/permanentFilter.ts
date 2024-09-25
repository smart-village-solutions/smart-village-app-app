import { useContext } from 'react';

import { PermanentFilterContext } from '../PermanentFilterProvider';

export const usePermanentFilter = () => {
  const {
    dataProviderDispatch,
    dataProviderState,
    mowasRegionalKeysDispatch,
    mowasRegionalKeysState,
    resourceFilterDispatch,
    resourceFilterState
  } = useContext(PermanentFilterContext);

  return {
    dataProviderDispatch,
    excludeDataProviderIds: dataProviderState,
    excludeMowasRegionalKeys: mowasRegionalKeysState,
    mowasRegionalKeysDispatch,
    resourceFilterDispatch,
    resourceFilterState
  };
};
