import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';

import {
  Button,
  HtmlView,
  LoadingSpinner,
  SafeAreaViewFlex,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { usePullToRefetch, useStaticContent } from '../hooks';

type EntryData = {
  text?: string;
  title: string;
  routeName: string;
  params?: Record<string, any>;
};

export const MultiButtonScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const name = route.params?.name;
  const { data, error, loading, refetch } = useStaticContent<EntryData[]>({
    name,
    skip: !name,
    type: 'json'
  });
  const RefreshControl = usePullToRefetch(refetch);
  const renderItem: ListRenderItem<EntryData> = useCallback(
    ({ item }) => (
      <WrapperWithOrientation>
        {!!item.text?.length && (
          <Wrapper style={styles.noPaddingBottom}>
            <HtmlView html={item.text} />
          </Wrapper>
        )}
        <Wrapper>
          <Button
            title={item.title}
            onPress={() => navigation.navigate(item.routeName, item.params)}
          />
        </Wrapper>
      </WrapperWithOrientation>
    ),
    [navigation]
  );

  if (loading && !error) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <FlatList
        refreshControl={RefreshControl}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.routeName + item.title}
      />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingBottom: {
    paddingBottom: 0
  }
});
