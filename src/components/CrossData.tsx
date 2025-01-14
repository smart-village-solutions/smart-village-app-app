import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, View } from 'react-native';

import { colors, texts } from '../config';
import { getTitleForQuery, graphqlFetchPolicy } from '../helpers';
import { getGenericItemSectionTitle } from '../helpers/genericTypeHelper';
import { useNewsCategories, useRefreshTime } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';
import { GenericType } from '../types';

import { DataListSection } from './DataListSection';
import { LoadingContainer } from './LoadingContainer';

type Props = {
  dataProviderName: string;
  navigation: StackNavigationProp<any>;
};

type SectionProps = {
  categoryId?: string;
  genericType?: GenericType;
  query: string;
  sectionTitle?: string;
  sectionTitleDetail?: string;
} & Props;

type CrossDataQueryVariables = {
  categoryId?: string;
  dataProvider: string;
  genericType?: GenericType;
  limit: number;
  order?: string;
};

const getNavigationFunction = (
  navigation: StackNavigationProp<any>,
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
  dataProviderName,
  genericType,
  navigation,
  query,
  sectionTitle,
  sectionTitleDetail
}: SectionProps) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { deprecated = {} } = globalSettings;
  const refreshTime = useRefreshTime(
    `crossData-${query}-${dataProviderName}-${categoryId}-${genericType}`
  );
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const variables: CrossDataQueryVariables = {
    categoryId,
    dataProvider: dataProviderName,
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
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  return (
    <DataListSection
      buttonTitle={texts.dataProvider.showAll}
      limit={3}
      navigateButton={getNavigationFunction(
        navigation,
        dataProviderName,
        query,
        sectionTitle,
        categoryId
      )}
      navigate={getNavigationFunction(
        navigation,
        dataProviderName,
        query,
        sectionTitle,
        categoryId
      )}
      navigation={navigation}
      query={query}
      sectionData={data}
      sectionTitle={sectionTitle}
      sectionTitleDetail={sectionTitleDetail}
      showButton={(data?.[query]?.length ?? 0) > 3}
    />
  );
};

export const CrossData = ({ dataProviderName, navigation }: Props) => {
  const categoriesNews = useNewsCategories();

  return (
    <View>
      <CrossDataSection
        dataProviderName={dataProviderName}
        genericType={GenericType.Job}
        navigation={navigation}
        query={QUERY_TYPES.GENERIC_ITEMS}
        sectionTitle={getGenericItemSectionTitle(GenericType.Job)}
      />
      <CrossDataSection
        dataProviderName={dataProviderName}
        genericType={GenericType.Commercial}
        navigation={navigation}
        query={QUERY_TYPES.GENERIC_ITEMS}
        sectionTitle={getGenericItemSectionTitle(GenericType.Commercial)}
      />
      <CrossDataSection
        dataProviderName={dataProviderName}
        genericType={GenericType.Noticeboard}
        navigation={navigation}
        query={QUERY_TYPES.GENERIC_ITEMS}
        sectionTitle={getGenericItemSectionTitle(GenericType.Noticeboard)}
      />
      <CrossDataSection
        dataProviderName={dataProviderName}
        genericType={GenericType.Deadline}
        navigation={navigation}
        query={QUERY_TYPES.GENERIC_ITEMS}
        sectionTitle={getGenericItemSectionTitle(GenericType.Deadline)}
      />
      {categoriesNews?.map(({ categoryId, categoryTitle, categoryTitleDetail }) => (
        <CrossDataSection
          categoryId={categoryId}
          dataProviderName={dataProviderName}
          key={categoryId}
          navigation={navigation}
          query={QUERY_TYPES.NEWS_ITEMS}
          sectionTitleDetail={categoryTitleDetail}
          sectionTitle={categoryTitle}
        />
      ))}
      <CrossDataSection
        dataProviderName={dataProviderName}
        navigation={navigation}
        query={QUERY_TYPES.POINTS_OF_INTEREST}
      />
      <CrossDataSection
        dataProviderName={dataProviderName}
        navigation={navigation}
        query={QUERY_TYPES.TOURS}
      />
      <CrossDataSection
        dataProviderName={dataProviderName}
        navigation={navigation}
        query={QUERY_TYPES.EVENT_RECORDS}
      />
    </View>
  );
};
