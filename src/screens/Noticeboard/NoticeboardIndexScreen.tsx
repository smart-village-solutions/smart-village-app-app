import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, RefreshControl } from 'react-native';

import { EmptyMessage, ListComponent, LoadingContainer, SafeAreaViewFlex } from '../../components';
import { colors, texts } from '../../config';
import { graphqlFetchPolicy, parseListItemsFromQuery } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery } from '../../queries';
import { ListHeaderComponent } from '../NestedInfoScreen';

export const NoticeboardIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const [refreshing, setRefreshing] = useState(false);
  const content = route.params?.content ?? '';
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const subQuery = route.params?.subQuery ?? '';

  const { data, loading, refetch } = useQuery(getQuery(query), {
    fetchPolicy,
    variables: queryVariables
  });
  const listItems = parseListItemsFromQuery(query, data, '', {
    queryVariables,
    subQuery
  });

  const {
    data: dataHtml,
    loading: loadingHtml,
    refetch: refetchHtml
  } = useStaticContent<string>({
    name: content,
    type: 'html',
    skip: !content
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetch?.();
      await refetchHtml?.();
    }
    setRefreshing(false);
  }, [isConnected, refetch]);

  if (loading && !listItems?.length)
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );

  if (!listItems) {
    return <EmptyMessage title={texts.noticeboard.emptyTitle} />;
  }

  return (
    <SafeAreaViewFlex>
      <ListComponent
        data={listItems}
        navigation={navigation}
        query={query}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
        ListHeaderComponent={
          <ListHeaderComponent
            html={dataHtml}
            loading={loadingHtml}
            navigation={navigation}
            navigationTitle=""
            subQuery={subQuery}
          />
        }
      />
    </SafeAreaViewFlex>
  );
};
