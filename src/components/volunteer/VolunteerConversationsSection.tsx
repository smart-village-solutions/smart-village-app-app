import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { useVolunteerData, useVolunteerRefresh } from '../../hooks';
import { VolunteerQuery } from '../../types';
import { DataListSection } from '../DataListSection';

type Props = {
  buttonTitle?: string;
  limit?: number;
  linkTitle?: string;
  navigate?: () => void;
  navigateButton?: () => void;
  navigateLink?: () => void;
  navigation: StackNavigationProp<any>;
  placeholder?: React.ReactElement;
  query: VolunteerQuery;
  queryVariables?: { dateRange?: string[] };
  sectionTitle?: string;
  sectionTitleDetail?: string;
  showButton?: boolean;
  showLink?: boolean;
};

export const VolunteerConversationsSection = ({
  buttonTitle,
  limit,
  linkTitle,
  navigate,
  navigateButton,
  navigateLink,
  navigation,
  placeholder,
  query,
  queryVariables,
  sectionTitle,
  sectionTitleDetail,
  showButton = true,
  showLink = false
}: Props) => {
  const { data: sectionData, isLoading, refetch } = useVolunteerData({
    query,
    queryVariables,
    queryOptions: {
      refetchInterval: 1000
    }
  });

  useVolunteerRefresh(refetch, query);

  return (
    <DataListSection
      loading={isLoading}
      buttonTitle={buttonTitle}
      linkTitle={linkTitle}
      limit={limit}
      navigate={navigate}
      navigation={navigation}
      placeholder={placeholder}
      query={query}
      sectionData={sectionData}
      sectionTitle={sectionTitle}
      sectionTitleDetail={sectionTitleDetail}
      showButton={showButton}
      showLink={showLink && !!sectionData?.length}
      navigateButton={navigateButton}
      navigateLink={navigateLink}
    />
  );
};
