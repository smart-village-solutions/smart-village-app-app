import React from 'react';
import { QueryHookOptions, useQuery } from 'react-apollo';
import { ActivityIndicator, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors } from '../config';
import { parseListItemsFromQuery } from '../helpers';
import { useHomeRefresh } from '../hooks/HomeRefresh';
import { getQuery } from '../queries';
import { Button } from './Button';
import { ListComponent } from './ListComponent';
import { LoadingContainer } from './LoadingContainer';
import { SectionHeader } from './SectionHeader';
import { Wrapper } from './Wrapper';

type Props = {
  title: string;
  titleDetail?: string;
  buttonTitle: string;
  fetchPolicy:
    | 'cache-first'
    | 'network-only'
    | 'cache-only'
    | 'no-cache'
    | 'standby'
    | 'cache-and-network';
  navigate: () => void;
  navigation: NavigationScreenProp<never>;
  query: string;
  queryParser?: (data: unknown) => unknown[];
  queryVariables: QueryHookOptions;
};

export const HomeSection = ({
  buttonTitle,
  title,
  titleDetail,
  fetchPolicy,
  navigate,
  navigation,
  query,
  queryParser,
  queryVariables
}: Props) => {
  const { data, loading, refetch } = useQuery(getQuery(query), {
    variables: queryVariables,
    fetchPolicy
  });

  useHomeRefresh(refetch);

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const items =
    queryParser?.(data) ?? parseListItemsFromQuery(query, data, true, titleDetail ?? '');

  if (!items || !items.length) return null;

  return (
    <>
      <SectionHeader title={title} onPress={navigate} />
      <View>
        <ListComponent navigation={navigation} data={items} query={query} />
        <Wrapper>
          <Button title={buttonTitle} onPress={navigate} />
        </Wrapper>
      </View>
    </>
  );
};
