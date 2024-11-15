import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useMemo } from 'react';
import { useQuery } from 'react-apollo';
import { RefreshControl } from 'react-native';

import { EmptyMessage, ListComponent, LoadingSpinner, SafeAreaViewFlex } from '../../components';
import { colors, texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { useProfileUser } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';

/* eslint-disable complexity */
export const ProfileConversationsScreen = ({ navigation }: StackScreenProps<any>) => {
  const { conversationSettings } = useContext(SettingsContext);
  const { currentUserData } = useProfileUser();
  const currentUserId = useMemo(() => currentUserData?.member?.id, [currentUserData]);
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

  const sortedListItems = useMemo(() => {
    if (!listItems) return [];

    const pinnedItems = listItems.filter((item) => conversationSettings?.pinned?.includes(item.id));
    const notPinnedItems = listItems.filter(
      (item) => !conversationSettings?.pinned?.includes(item.id)
    );

    return [...pinnedItems, ...notPinnedItems];
  }, [listItems, conversationSettings?.pinned]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (loading && !currentUserId) {
    return <LoadingSpinner loading />;
  }

  if (!conversationData) return null;

  return (
    <SafeAreaViewFlex>
      <ListComponent
        ListEmptyComponent={<EmptyMessage title={texts.empty.list} />}
        data={sortedListItems}
        navigation={navigation}
        query={query}
        queryVariables={{ currentUserId }}
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
/* eslint-enable complexity */
