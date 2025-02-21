import React, { useContext, useEffect } from 'react';
import { useQuery } from 'react-apollo';
import { FlatList } from 'react-native';

import { LoadingSpinner, WrapperHorizontal } from '..';
import { graphqlFetchPolicy } from '../../helpers';
import { usePermanentFilter, useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { addDataProvidersToTokenOnServer } from '../../pushNotifications';
import { getQuery, QUERY_TYPES } from '../../queries';
import { PermanentFilterActions } from '../../reducers';
import { SettingsToggle } from '../SettingsToggle';

const keyExtractor = (item: { id: number }, index: number) => `index${index}-id${item.id}`;

export const PermanentFilterSettings = () => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const refreshTime = useRefreshTime('settings-dataProviders');

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const { excludeDataProviderIds: excludedDataProviderIds, dataProviderDispatch: dispatch } =
    usePermanentFilter();

  const { data, loading } = useQuery(getQuery(QUERY_TYPES.NEWS_ITEMS_DATA_PROVIDER), {
    fetchPolicy
  });

  const dataProviderIds = (data?.newsItemsDataProviders?.map((item: { id: string }) => item.id) ||
    []) as string[];

  useEffect(() => {
    !!dataProviderIds?.length &&
      addDataProvidersToTokenOnServer(excludedDataProviderIds.map((id) => parseInt(id, 10)));
  }, [excludedDataProviderIds]);

  if (!data && loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <FlatList
      data={data?.newsItemsDataProviders}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => (
        <WrapperHorizontal>
          <SettingsToggle
            item={{
              title: item.name,
              bottomDivider: true,
              value: !excludedDataProviderIds.includes(item.id),
              onActivate: () => {
                dispatch({ type: PermanentFilterActions.RemoveDataProvider, payload: item.id });
              },
              onDeactivate: () => {
                dispatch({ type: PermanentFilterActions.AddDataProvider, payload: item.id });
              }
            }}
          />
        </WrapperHorizontal>
      )}
    />
  );
};
