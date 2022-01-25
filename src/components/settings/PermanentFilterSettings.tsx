import gql from 'graphql-tag';
import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { View } from 'react-native';

import { graphqlFetchPolicy } from '../../helpers';
import { usePermanentFilter, useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { FilterAction } from '../../types';
import { SettingsToggle } from '../SettingsToggle';

export const PermanentFilterSettings = () => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const refreshTime = useRefreshTime('settings-dataProviders');

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const { state, dispatch } = usePermanentFilter();

  const { data } = useQuery(
    gql`
      query dataProviders {
        newsItemsDataProviders {
          id
          name
        }
      }
    `,
    { fetchPolicy }
  );

  return (
    <View>
      {data?.newsItemsDataProviders?.map((item: { id: string; name: string }) => {
        const options = {
          title: item.name,
          bottomDivider: true,
          value: !state.includes(item.id),
          onActivate: () => {
            dispatch({ type: FilterAction.RemoveDataProvider, payload: item.id });
          },
          onDeactivate: () => {
            dispatch({ type: FilterAction.AddDataProvider, payload: item.id });
          }
        };

        return <SettingsToggle key={item.id} item={options} />;
      })}
    </View>
  );
};
