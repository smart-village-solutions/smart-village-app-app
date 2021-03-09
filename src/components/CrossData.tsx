import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, texts } from '../config';
import { getTitleForQuery, graphqlFetchPolicy } from '../helpers';
import { getGenericItemSectionTitle } from '../helpers/genericTypeHelper';
import { useNewsCategories, useRefreshTime } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { GenericType } from '../types';
import { DataListSection } from './DataListSection';
import { LoadingContainer } from './LoadingContainer';

type Props = {
  dataProviderId: string;
  dataProviderName: string;
  navigation: NavigationScreenProp<never>;
};

type SectionProps = {
  categoryId?: string;
  genericType?: GenericType;
  query: string;
  titleDetail?: string;
  titleSection?: string;
} & Props;

type CrossDataQueryVariables = {
  categoryId?: string;
  dataProviderId: string;
  genericType?: GenericType;
  limit: number;
  order?: string;
};

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
  dataProviderId,
  dataProviderName,
  genericType,
  navigation,
  query,
  titleDetail,
  titleSection
}: SectionProps) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const refreshTime = useRefreshTime(
    `crossData-${query}-${dataProviderId}-${categoryId}-${genericType}`
  );
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const variables: CrossDataQueryVariables = {
    categoryId,
    dataProviderId,
    limit: 4
  };

  if (query === QUERY_TYPES.EVENT_RECORDS) {
    variables.order = 'listDate_ASC';
  }

  if (query === QUERY_TYPES.GENERIC_ITEMS) {
    variables.genericType = genericType;
  }

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
        titleSection,
        categoryId
      )}
      navigation={navigation}
      query={query}
      sectionData={data}
      sectionTitle={titleSection}
      sectionTitleDetail={titleDetail}
      showButton={(data?.[query]?.length ?? 0) > 3}
    />
  );
};

export const CrossData = ({ dataProviderId, dataProviderName, navigation }: Props) => {
  const categoriesNews = useNewsCategories();

  return (
    <View>
      <CrossDataSection
        dataProviderId={dataProviderId}
        dataProviderName={dataProviderName}
        genericType={GenericType.Job}
        navigation={navigation}
        query={QUERY_TYPES.GENERIC_ITEMS}
        titleSection={getGenericItemSectionTitle(GenericType.Job)}
      />
      <CrossDataSection
        dataProviderId={dataProviderId}
        dataProviderName={dataProviderName}
        genericType={GenericType.Commercial}
        navigation={navigation}
        query={QUERY_TYPES.GENERIC_ITEMS}
        titleSection={getGenericItemSectionTitle(GenericType.Commercial)}
      />
      {categoriesNews?.map(({ categoryId, categoryTitle, categoryTitleDetail }) => (
        <CrossDataSection
          categoryId={categoryId}
          dataProviderId={dataProviderId}
          dataProviderName={dataProviderName}
          key={categoryId}
          navigation={navigation}
          query={QUERY_TYPES.NEWS_ITEMS}
          titleDetail={categoryTitleDetail}
          titleSection={categoryTitle}
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
