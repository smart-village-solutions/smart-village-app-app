import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';

import {
  Button,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { useStaticContent } from '../hooks';

type EntryData = {
  text?: string;
  title: string;
  routeName: string;
  params?: Record<string, any>;
};

export const MultiButtonScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const name = route.params?.name;
  const { data, error, loading } = useStaticContent<EntryData[]>({
    name,
    skip: !name,
    type: 'json'
  });
  const renderItem: ListRenderItem<EntryData> = useCallback(
    ({ item }) => {
      return (
        <WrapperWithOrientation>
          <>
            {!!item.text?.length && (
              <Wrapper style={styles.noPaddingBottom}>
                <RegularText>{item.text}</RegularText>
              </Wrapper>
            )}
            <Wrapper>
              <Button
                title={item.title}
                onPress={() => navigation.navigate(item.routeName, item.params)}
              />
            </Wrapper>
          </>
        </WrapperWithOrientation>
      );
    },
    [navigation]
  );

  if (!name || error) {
    return null;
  }

  if (loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <FlatList
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
