import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { useQuery } from 'react-query';

import { useVolunteerData, useVolunteerHomeRefresh } from '../../hooks';
import { getQuery } from '../../queries';
import { DataListSection } from '../DataListSection';

type Props = {
  buttonTitle?: string;
  linkTitle?: string;
  title?: string;
  titleDetail?: string;
  navigate?: () => void;
  navigation: StackNavigationProp<any>;
  placeholder?: React.ReactElement;
  query: string;
  queryVariables?: { dateRange?: string[] };
  showButton?: boolean;
  showLink?: boolean;
  navigateButton?: () => void;
  navigateLink?: () => void;
  limit?: number;
};

export const VolunteerHomeSection = ({
  buttonTitle,
  linkTitle,
  title,
  titleDetail,
  navigate,
  navigation,
  placeholder,
  query,
  queryVariables,
  showButton = true,
  showLink = false,
  navigateButton,
  navigateLink,
  limit = 3
}: Props) => {
  const { data: sectionData, isLoading, refetch } = useVolunteerData({ query, queryVariables });

  useVolunteerHomeRefresh(refetch);

  return (
    <DataListSection
      buttonTitle={buttonTitle}
      linkTitle={linkTitle}
      limit={limit}
      loading={isLoading}
      navigate={navigate}
      navigation={navigation}
      placeholder={placeholder}
      query={query}
      sectionData={sectionData}
      sectionTitle={title}
      sectionTitleDetail={titleDetail}
      showButton={showButton}
      showLink={showLink}
      navigateButton={navigateButton}
      navigateLink={navigateLink}
    />
  );
};
