import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { colors } from '../config';
import { graphqlFetchPolicy } from '../helpers';
import { useRefreshTime } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { DataListSection } from './DataListSection';
import { LoadingContainer } from './LoadingContainer';

type Props = {
  dataProviderId: string;
  query: never;
  navigation: NavigationScreenProp<never>;
};

const crossDataTypes = [
  QUERY_TYPES.NEWS_ITEMS,
  QUERY_TYPES.TOURS,
  QUERY_TYPES.POINTS_OF_INTEREST,
  QUERY_TYPES.EVENT_RECORDS
];

// TODO: add refetch system
export const CrossDataSection = ({ dataProviderId, navigation, query }: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const refreshTime = useRefreshTime(`crossData-${dataProviderId}`);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const variables = {
    dataProviderId,
    orderEventRecords: 'listDate_ASC',
    limit: 3
  };

  const { data, loading } = useQuery(getQuery(QUERY_TYPES.CROSS_DATA), {
    fetchPolicy,
    variables,
    skip: !refreshTime
  });

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  // only show cross data of other types
  const otherCrossDataTypes = crossDataTypes.filter((dataType) => dataType !== query);

  return otherCrossDataTypes.map((crossDataType, index) => (
    <DataListSection
      key={`${index}-${crossDataType}`}
      horizontal={false}
      sectionData={data}
      query={crossDataType}
      navigation={navigation}
    />
  ));
};
