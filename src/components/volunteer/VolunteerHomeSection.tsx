import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { QueryFunction, useQuery } from 'react-query';

import { useVolunteerHomeRefresh } from '../../hooks';
import { DataListSection } from '../DataListSection';

type Props = {
  buttonTitle: string;
  linkTitle: string;
  title: string;
  titleDetail?: string;
  fetchPolicy:
    | 'cache-first'
    | 'network-only'
    | 'cache-only'
    | 'no-cache'
    | 'standby'
    | 'cache-and-network';
  navigate: () => void;
  navigation: StackNavigationProp<any>;
  placeholder?: React.ReactElement;
  queryKey: string;
  query: QueryFunction;
  queryVariables: { limit?: number };
  showButton: boolean;
  navigateButton: () => void;
  showLink: boolean;
  navigateLink: () => void;
};

export const VolunteerHomeSection = ({
  buttonTitle,
  linkTitle,
  title,
  titleDetail,
  fetchPolicy,
  navigate,
  navigation,
  placeholder,
  queryKey,
  query,
  queryVariables,
  showButton = true,
  showLink = false,
  navigateButton,
  navigateLink
}: Props) => {
  // TODO: change with react query to humhub
  const { data, loading, refetch } = useQuery(queryKey, query);

  useVolunteerHomeRefresh(refetch);

  return (
    <DataListSection
      buttonTitle={buttonTitle}
      linkTitle={linkTitle}
      limit={queryVariables?.limit}
      loading={loading}
      navigate={navigate}
      navigation={navigation}
      placeholder={placeholder}
      query={query}
      sectionData={data}
      sectionTitle={title}
      sectionTitleDetail={titleDetail}
      showButton={showButton}
      showLink={showLink}
      navigateButton={navigateButton}
      navigateLink={navigateLink}
    />
  );
};
