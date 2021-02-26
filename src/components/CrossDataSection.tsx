import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, texts } from '../config';
import { getTitleForQuery, graphqlFetchPolicy } from '../helpers';
import { useRefreshTime } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { DataListSection } from './DataListSection';
import { LoadingContainer } from './LoadingContainer';

type Props = {
  dataProviderId: string;
  dataProviderName: string;
  navigation: NavigationScreenProp<never>;
};

const crossDataTypes = [
  QUERY_TYPES.NEWS_ITEMS,
  QUERY_TYPES.POINTS_OF_INTEREST,
  QUERY_TYPES.TOURS,
  QUERY_TYPES.EVENT_RECORDS
];

const getNavigationFunction = (
  navigation: NavigationScreenProp<never>,
  dataProviderName: string,
  query: string
) => {
  return () =>
    navigation.push('Index', {
      queryVariables: { dataProvider: dataProviderName },
      query,
      title: getTitleForQuery(query)
    });
};

export const CrossDataSection = ({ dataProviderId, dataProviderName, navigation }: Props) => {
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

  return crossDataTypes.map((crossDataType, index) => (
    <DataListSection
      key={`${index}-${crossDataType}`}
      horizontal={false}
      query={crossDataType}
      sectionData={data}
      navigation={navigation}
      buttonTitle={texts.dataProvider.showAll}
      navigate={getNavigationFunction(navigation, dataProviderName, crossDataType)}
      showButton
    />
  ));
};
