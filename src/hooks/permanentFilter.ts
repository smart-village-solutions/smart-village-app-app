import { useContext } from 'react';

import { PermanentFilterContext } from '../PermanentFilterProvider';

export const usePermanentFilter = () => {
  const {
    dataProviderState,
    dataProviderDispatch,
    mowasRegionalKeysState,
    mowasRegionalKeysDispatch
  } = useContext(PermanentFilterContext);

  const excludeDataProviderIds = dataProviderState;
  const excludeMowasRegionalKeys = mowasRegionalKeysState;

  return {
    excludeDataProviderIds,
    excludeMowasRegionalKeys,
    dataProviderDispatch,
    mowasRegionalKeysDispatch
  };
};
