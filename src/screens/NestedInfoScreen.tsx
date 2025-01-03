import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet } from 'react-native';

import {
  HtmlView,
  LoadingContainer,
  LoadingSpinner,
  MultiButtonWithSubQuery,
  SafeAreaViewFlex,
  SectionHeader,
  WrapperVertical
} from '../components';
import { colors, normalize } from '../config';
import { useStaticContent } from '../hooks';
import { useRenderItem } from '../hooks/listHooks';
import { NetworkContext } from '../NetworkProvider';
import { QUERY_TYPES } from '../queries';
import { SubQuery } from '../types';

type NestedInfo = {
  content?: string;
  title: string;
  children: Array<{
    title: string;
    routeName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: any;
  }>;
};

export const ListHeaderComponent = ({
  html,
  loading,
  navigation,
  navigationTitle,
  subQuery
}: {
  html?: string;
  loading: boolean;
  navigation: StackNavigationProp<any>;
  navigationTitle?: string;
  subQuery?: SubQuery;
}) => {
  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!html?.length) {
    return null;
  }

  return (
    <WrapperVertical style={styles.noPaddingBottom}>
      {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
      <HtmlView html={html} />
      <MultiButtonWithSubQuery {...{ navigation, subQuery, title: navigationTitle }} />
    </WrapperVertical>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NestedInfoScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { isConnected } = useContext(NetworkContext);
  const [refreshing, setRefreshing] = useState(false);
  const name = route.params?.name;
  const rootRouteName = route.params?.rootRouteName;
  const subQuery = route.params?.subQuery ?? undefined;
  const navigationTitle = route.params?.title;

  const { data, loading, refetch } = useStaticContent<NestedInfo>({ name, type: 'json' });
  const {
    data: dataHtml,
    loading: loadingHtml,
    refetch: refetchHtml
  } = useStaticContent<string>({
    name: data?.content ?? '',
    type: 'html',
    skip: !data?.content
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
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );

  if (!data) {
    return null;
  }

  // aggregate current rootRouteName and title for navigation, if they are not present in params of children
  const sectionData = [
    {
      title: data.title,
      data:
        data.children?.map((child) => {
          return {
            ...child,
            params: {
              ...child.params,
              rootRouteName: child.params?.rootRouteName ?? rootRouteName,
              title: child.params?.title ?? navigationTitle
            }
          };
        }) || []
    }
  ];

  return (
    <SafeAreaViewFlex>
      <SectionList
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
            navigationTitle={navigationTitle}
            subQuery={subQuery}
          />
        }
        sections={sectionData}
        renderSectionHeader={({ section: { title } }) =>
          title ? (
            <SectionHeader title={title} containerStyle={styles.sectionHeaderContainer} />
          ) : null
        }
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        style={styles.container}
      />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(16)
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  sectionHeaderContainer: {
    marginHorizontal: -normalize(14)
  }
});
