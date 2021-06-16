import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { QueryHookOptions, useQuery } from 'react-apollo';

import { useHomeRefresh } from '../hooks/HomeRefresh';
import { getQuery } from '../queries';
import { DataListSection } from './DataListSection';

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
  navigation: StackNavigationProp<any>;
  query: string;
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
  queryVariables
}: Props) => {
  const { data, loading, refetch } = useQuery(getQuery(query), {
    variables: queryVariables,
    fetchPolicy
  });

  useHomeRefresh(refetch);

  return (
    <DataListSection
      buttonTitle={buttonTitle}
      loading={loading}
      navigate={navigate}
      navigation={navigation}
      query={query}
      sectionData={data}
      sectionTitle={title}
      sectionTitleDetail={titleDetail}
      showButton
    />
  );
};
