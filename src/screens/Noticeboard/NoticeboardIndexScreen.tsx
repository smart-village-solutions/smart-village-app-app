import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, RefreshControl } from 'react-native';

import {
  EmptyMessage,
  Filter,
  ListComponent,
  LoadingContainer,
  SafeAreaViewFlex
} from '../../components';
import { colors, texts } from '../../config';
import {
  filterTypesHelper,
  graphqlFetchPolicy,
  parseListItemsFromQuery,
  updateResourceFiltersStateHelper
} from '../../helpers';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery } from '../../queries';
import { ListHeaderComponent } from '../NestedInfoScreen';
import { PermanentFilterContext } from '../../PermanentFilterProvider';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { GenericType } from '../../types';

export const NoticeboardIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const [refreshing, setRefreshing] = useState(false);

  const consentForDataProcessingText = route.params?.consentForDataProcessingText ?? '';
  const content = route.params?.content ?? '';
  const query = route.params?.query ?? '';
  const initialQueryVariables = route.params?.queryVariables ?? {};
  const subQuery = route.params?.subQuery ?? '';
  const { resourceFiltersState = {}, resourceFiltersDispatch } = useContext(PermanentFilterContext);
  const { resourceFilters } = useContext(ConfigurationsContext);
  const [queryVariables, setQueryVariables] = useState({
    ...initialQueryVariables,
    ...resourceFiltersState[GenericType.Noticeboard]
  });

  const { data, loading, refetch } = useQuery(getQuery(query), {
    fetchPolicy,
    variables: queryVariables
  });

  const listItems = parseListItemsFromQuery(query, data, '', {
    consentForDataProcessingText,
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

  const filterTypes = useMemo(() => {
    return filterTypesHelper({
      data,
      query: GenericType.Noticeboard,
      queryVariables,
      resourceFilters
    });
  }, [data]);

  useEffect(() => {
    updateResourceFiltersStateHelper({
      query: GenericType.Noticeboard,
      queryVariables,
      resourceFiltersDispatch,
      resourceFiltersState
    });
  }, [query, queryVariables]);

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
      <Filter
        filterTypes={filterTypes}
        initialFilters={initialQueryVariables}
        isOverlay
        queryVariables={queryVariables}
        setQueryVariables={setQueryVariables}
      />
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
