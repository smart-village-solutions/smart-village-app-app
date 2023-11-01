/* eslint-disable complexity */
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useQuery } from 'react-query';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import { ListComponent, SafeAreaViewFlex } from '../../components';
import { colors } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { getQuery } from '../../queries';

type Props = {
  navigation: StackNavigationProp<Record<string, any>>;
  route: RouteProp<any, never>;
};

export const SueListScreen = ({ navigation, route }: Props) => {
  const { isConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useQuery([query, queryVariables], () =>
    getQuery(query)(queryVariables)
  );

  const listItems = useMemo(() => {
    return parseListItemsFromQuery(query, data, undefined, undefined);
  }, [data, query, queryVariables]);

  const refresh = async () => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  return (
    <SafeAreaViewFlex>
      <ListComponent
        navigation={navigation}
        query={query}
        data={listItems}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        showBackToTop
      />
    </SafeAreaViewFlex>
  );
};
