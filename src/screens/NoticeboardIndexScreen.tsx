import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, RefreshControl, SectionList } from 'react-native';

import { EmptyMessage, LoadingContainer, SafeAreaViewFlex, SectionHeader } from '../components';
import { colors, texts } from '../config';
import { graphqlFetchPolicy, parseListItemsFromQuery } from '../helpers';
import { useStaticContent } from '../hooks';
import { useRenderItem } from '../hooks/listHooks';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';

import { ListHeaderComponent } from './NestedInfoScreen';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable complexity */
export const NoticeboardIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const [refreshing, setRefreshing] = useState(false);

  const consentForDataProcessingText = route.params?.consentForDataProcessingText ?? '';
  const content = route.params?.content ?? '';
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const subQuery = route.params?.subQuery ?? '';
  const title = route.params?.title ?? '';

  const { data, loading, refetch } = useQuery(getQuery(query), {
    fetchPolicy,
    variables: queryVariables
  });
  const listItems = parseListItemsFromQuery(query, data, consentForDataProcessingText, {
    queryVariables
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

  const renderItem = useRenderItem(QUERY_TYPES.PUBLIC_JSON_FILE, navigation);

  if (loading && !data)
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );

  if (!data) {
    return <EmptyMessage title={texts.noticeboard.emptyTitle} />;
  }

  const sectionData = [{ title: title, data: listItems }];

  return (
    <SafeAreaViewFlex>
      <SectionList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={
          <ListHeaderComponent
            loading={loadingHtml}
            html={dataHtml}
            subQuery={subQuery}
            navigation={navigation}
          />
        }
        sections={sectionData}
        renderSectionHeader={({ section: { title } }) => <SectionHeader title={title} />}
        renderItem={renderItem}
        keyExtractor={(item) => item.title + item.id}
      />
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */
