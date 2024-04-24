import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useMemo } from 'react';
import { useQuery } from 'react-apollo';
import { RefreshControl } from 'react-native';

import { EmptyMessage, ListComponent, LoadingSpinner, SafeAreaViewFlex } from '../../components';
import { colors, texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { QUERY_TYPES, getQuery } from '../../queries';

// eslint-disable-next-line complexity
export const ProfileConversationsScreen = ({ navigation }: StackScreenProps<any>) => {
  const query = QUERY_TYPES.PROFILE.GET_CONVERSATIONS;

  const {
    data: conversationData,
    loading,
    refetch
  } = useQuery(getQuery(query), { pollInterval: 10000 });

  const listItems = useMemo(
    () => parseListItemsFromQuery(query, conversationData, undefined),
    [query, conversationData]
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!conversationData) return null;

  return (
    <SafeAreaViewFlex>
      <ListComponent
        ListEmptyComponent={<EmptyMessage title={texts.empty.list} />}
        data={listItems}
        navigation={navigation}
        query={query}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      />
    </SafeAreaViewFlex>
  );
};
