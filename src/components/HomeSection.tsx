import React from 'react';
import { QueryHookOptions, useQuery } from 'react-apollo';
import { NavigationScreenProp } from 'react-navigation';

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
  navigation: NavigationScreenProp<never>;
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
      loading={loading}
      navigation={navigation}
      query={query}
      buttonTitle={buttonTitle}
      sectionData={data}
      navigate={navigate}
      sectionTitle={title}
      sectionTitleDetail={titleDetail}
      showButton
    />
  );
};
