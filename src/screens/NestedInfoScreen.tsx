import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, SectionList } from 'react-native';

import {
  Button,
  HtmlView,
  LoadingContainer,
  LoadingSpinner,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { colors } from '../config';
import { useStaticContent } from '../hooks';
import { useRenderItem } from '../hooks/listHooks';
import { NetworkContext } from '../NetworkProvider';
import { QUERY_TYPES } from '../queries';

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
  subQuery
}: {
  html?: string;
  loading: boolean;
  navigation: StackNavigationProp<any>;
  subQuery?: {
    buttonTitle: string;
    params: { rootRouteName: string; title: string };
    routeName: string;
  };
}) => {
  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!html?.length) {
    return null;
  }

  return (
    <WrapperWithOrientation>
      <Wrapper>
        {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
        <HtmlView html={html} />
        {!!subQuery && !!subQuery.routeName && subQuery.params && (
          <Button
            title={subQuery.buttonTitle}
            onPress={() =>
              navigation.navigate({ name: subQuery.routeName, params: subQuery.params })
            }
          />
        )}
      </Wrapper>
    </WrapperWithOrientation>
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
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );

  if (!data) {
    return null;
  }

  // aggregate current rootRouteName and title for navigation, if they are not present in params of children
  const sectionData = [
    {
      title: data.title,
      data: data.children?.map((child) => {
        return {
          ...child,
          params: {
            ...child.params,
            rootRouteName: child.params?.rootRouteName ?? rootRouteName,
            title: child.params?.title ?? navigationTitle
          }
        };
      })
    }
  ];

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
        keyExtractor={(item) => item.title}
      />
    </SafeAreaViewFlex>
  );
};
