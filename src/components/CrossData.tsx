import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, texts } from '../config';
import { getTitleForQuery, graphqlFetchPolicy } from '../helpers';
import { useRefreshTime } from '../hooks';
import { useNewsCategories } from '../hooks/NewsCategories';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { DataListSection } from './DataListSection';
import { LoadingContainer } from './LoadingContainer';

type Props = {
  dataProviderId: string;
  dataProviderName: string;
  navigation: NavigationScreenProp<never>;
};

type SectionProps = {
  categoryId?: string;
  categoryTitle?: string;
  categoryTitleDetail?: string;
  query: string;
} & Props;

const getNavigationFunction = (
  navigation: NavigationScreenProp<never>,
  dataProviderName: string,
  query: string,
  title?: string,
  categoryId?: string
) => {
  return () =>
    navigation.push('Index', {
      queryVariables: { dataProvider: dataProviderName, categoryId },
      query,
      title: title ?? getTitleForQuery(query),
      showFilter: false
    });
};

const CrossDataSection = ({
  categoryId,
  categoryTitle,
  categoryTitleDetail,
  dataProviderId,
  dataProviderName,
  navigation,
  query
}: SectionProps) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const refreshTime = useRefreshTime(`crossData-${query}-${dataProviderId}-${categoryId}`);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const variables = {
    categoryId,
    dataProviderId,
    orderEventRecords: 'listDate_ASC',
    limit: 4
  };

  const { data, loading } = useQuery(getQuery(query), {
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

  return (
    <DataListSection
      buttonTitle={texts.dataProvider.showAll}
      limit={3}
      navigate={getNavigationFunction(
        navigation,
        dataProviderName,
        query,
        categoryTitle,
        categoryId
      )}
      navigation={navigation}
      query={query}
      sectionData={data}
      sectionTitle={categoryTitle}
      sectionTitleDetail={categoryTitleDetail}
      showButton={(data?.[query]?.length ?? 0) > 3}
    />
  );
};

export const CrossData = ({ dataProviderId, dataProviderName, navigation }: Props) => {
  const categoriesNews = useNewsCategories();

  return (
    <View>
      {categoriesNews?.map(({ categoryId, categoryTitle, categoryTitleDetail }) => (
        <CrossDataSection
          categoryId={categoryId}
          categoryTitle={categoryTitle}
          categoryTitleDetail={categoryTitleDetail}
          dataProviderId={dataProviderId}
          dataProviderName={dataProviderName}
          key={categoryId}
          navigation={navigation}
          query={QUERY_TYPES.NEWS_ITEMS}
        />
      ))}
      <CrossDataSection
        dataProviderId={dataProviderId}
        dataProviderName={dataProviderName}
        navigation={navigation}
        query={QUERY_TYPES.POINTS_OF_INTEREST}
      />
      <CrossDataSection
        dataProviderId={dataProviderId}
        dataProviderName={dataProviderName}
        navigation={navigation}
        query={QUERY_TYPES.TOURS}
      />
      <CrossDataSection
        dataProviderId={dataProviderId}
        dataProviderName={dataProviderName}
        navigation={navigation}
        query={QUERY_TYPES.EVENT_RECORDS}
      />
    </View>
  );
};
