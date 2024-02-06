/* eslint-disable complexity */
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { useInfiniteQuery } from 'react-query';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import {
  ListComponent,
  LoadingContainer,
  SafeAreaViewFlex,
  SueLoadingIndicator
} from '../../components';
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
  const { appDesignSystem = {} } = globalSettings;
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? { offset: 0, limit: 10000 };
  const [refreshing, setRefreshing] = useState(false);

  const { data, fetchNextPage, hasNextPage, isLoading, refetch } = useInfiniteQuery(
    [query, queryVariables],
    ({ pageParam }) => getQuery(query)({ ...queryVariables, offset: pageParam || 0 }),
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage?.length === 0) return; // no more pages

        // increment offset for the next page
        return (allPages?.length || 1) * queryVariables.limit;
      }
    }
  );

  const dataPages = data?.pages?.flat() || [];

  const listItems = useMemo(() => {
    if (!dataPages?.length) return [];

    return parseListItemsFromQuery(query, dataPages, undefined, { appDesignSystem }).reverse();
  }, [dataPages, query, queryVariables]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

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
        fetchMoreData={hasNextPage ? fetchNextPage : undefined}
        ListFooterLoadingIndicator={SueLoadingIndicator}
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
