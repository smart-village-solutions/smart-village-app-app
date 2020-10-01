import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Query } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { GlobalSettingsContext } from '../GlobalSettingsProvider';
import { auth } from '../auth';
import { colors, normalize } from '../config';
import {
  CardList,
  CategoryList,
  Icon,
  ListHeader,
  LoadingContainer,
  SafeAreaViewFlex,
  TextList
} from '../components';
import { getQuery, getFetchMoreQuery, QUERY_TYPES } from '../queries';
import { arrowLeft } from '../icons';
import {
  eventDate,
  graphqlFetchPolicy,
  mainImageOfMediaContents,
  momentFormat,
  shareMessage
} from '../helpers';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
const getListItems = (query, data) => {
  switch (query) {
  case QUERY_TYPES.EVENT_RECORDS:
    return (
      data &&
        data[query] &&
        data[query].map((eventRecord) => ({
          id: eventRecord.id,
          subtitle: `${eventDate(eventRecord.listDate)} | ${
            !!eventRecord.addresses &&
            !!eventRecord.addresses.length &&
            (eventRecord.addresses[0].addition || eventRecord.addresses[0].city)
          }`,
          title: eventRecord.title,
          routeName: 'Detail',
          params: {
            title: 'Veranstaltung',
            query: QUERY_TYPES.EVENT_RECORD,
            queryVariables: { id: `${eventRecord.id}` },
            rootRouteName: 'EventRecords',
            shareContent: {
              message: shareMessage(eventRecord, QUERY_TYPES.EVENT_RECORD)
            },
            details: eventRecord
          }
        }))
    );
  case QUERY_TYPES.NEWS_ITEMS:
    return (
      data &&
        data[query] &&
        data[query].map((newsItem) => ({
          id: newsItem.id,
          subtitle: `${momentFormat(newsItem.publishedAt)} | ${
            !!newsItem.dataProvider && newsItem.dataProvider.name
          }`,
          title:
            !!newsItem.contentBlocks &&
            !!newsItem.contentBlocks.length &&
            newsItem.contentBlocks[0].title,
          routeName: 'Detail',
          params: {
            title: 'Nachricht',
            query: QUERY_TYPES.NEWS_ITEM,
            queryVariables: { id: `${newsItem.id}` },
            rootRouteName: 'NewsItems',
            shareContent: {
              message: shareMessage(newsItem, QUERY_TYPES.NEWS_ITEM)
            },
            details: newsItem
          }
        }))
    );
  case QUERY_TYPES.POINTS_OF_INTEREST:
    return (
      data &&
        data[query] &&
        data[query].map((pointOfInterest) => ({
          id: pointOfInterest.id,
          name: pointOfInterest.name,
          category: !!pointOfInterest.category && pointOfInterest.category.name,
          image: mainImageOfMediaContents(pointOfInterest.mediaContents),
          routeName: 'Detail',
          params: {
            title: 'Ort',
            query: QUERY_TYPES.POINT_OF_INTEREST,
            queryVariables: { id: `${pointOfInterest.id}` },
            rootRouteName: 'PointsOfInterest',
            shareContent: {
              message: shareMessage(pointOfInterest, QUERY_TYPES.POINT_OF_INTEREST)
            },
            details: pointOfInterest
          }
        }))
    );
  case QUERY_TYPES.TOURS:
    return (
      data &&
        data[query] &&
        data[query].map((tour) => ({
          id: tour.id,
          name: tour.name,
          category: !!tour.category && tour.category.name,
          image: mainImageOfMediaContents(tour.mediaContents),
          routeName: 'Detail',
          params: {
            title: 'Tour',
            query: QUERY_TYPES.TOUR,
            queryVariables: { id: `${tour.id}` },
            rootRouteName: 'Tours',
            shareContent: {
              message: shareMessage(tour, QUERY_TYPES.TOUR)
            },
            details: tour
          }
        }))
    );

  case QUERY_TYPES.CATEGORIES: {
    return (
      data &&
        data[query] &&
        data[query].map((category) => ({
          id: category.id,
          title: category.name,
          pointsOfInterestCount: category.pointsOfInterestCount,
          toursCount: category.toursCount,
          routeName: 'Index',
          params: {
            title: category.name,
            query:
              category.pointsOfInterestCount > 0
                ? QUERY_TYPES.POINTS_OF_INTEREST
                : QUERY_TYPES.TOURS,
            queryVariables: { order: 'name_ASC', category: `${category.name}` },
            rootRouteName: category.pointsOfInterestCount > 0 ? 'PointsOfInterest' : 'Tours'
          }
        }))
    );
  }
  }
};
/* eslint-enable complexity */

const getComponent = (query) => {
  const COMPONENTS = {
    [QUERY_TYPES.EVENT_RECORDS]: TextList,
    [QUERY_TYPES.NEWS_ITEMS]: TextList,
    [QUERY_TYPES.POINTS_OF_INTEREST]: CardList,
    [QUERY_TYPES.TOURS]: CardList,
    [QUERY_TYPES.CATEGORIES]: CategoryList
  };

  return COMPONENTS[query];
};

const getListHeaderComponent = (query, queryVariables, data, updateListData) => {
  switch (query) {
  case QUERY_TYPES.NEWS_ITEMS:
    return (
      <ListHeader queryVariables={queryVariables} data={data} updateListData={updateListData} />
    );
  }
};

export const IndexScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const query = navigation.getParam('query', '');
  const [queryVariables, setQueryVariables] = useState(navigation.getParam('queryVariables', {}));
  const [refreshing, setRefreshing] = useState(false);

  if (!query) return null;

  useEffect(() => {
    isConnected && auth();
  }, []);

  const refresh = async (refetch) => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const globalSettings = useContext(GlobalSettingsContext);
  const { filter = {} } = globalSettings;
  const { news: showNewsFilter = false } = filter;
  const Component = getComponent(query);

  const updateListData = (selectedDataProvider) => {
    if (selectedDataProvider) {
      setQueryVariables({
        ...queryVariables,
        dataProvider: selectedDataProvider
      });
    } else {
      /* NOTE: remove `dataProvider`, which is super easy with spread operator */
      /* eslint-disable-next-line no-unused-vars */
      const { dataProvider, ...queryVariablesWithoutDataProvider } = queryVariables;

      setQueryVariables(queryVariablesWithoutDataProvider);
    }
  };

  return (
    <Query
      query={getQuery(query, { showNewsFilter })}
      variables={queryVariables}
      fetchPolicy={fetchPolicy}
    >
      {({ data, loading, fetchMore, refetch }) => {
        if (loading) {
          return (
            <LoadingContainer>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          );
        }

        const listItems = getListItems(query, data);

        if (!listItems || !listItems.length) return null;

        const fetchMoreData = () =>
          fetchMore({
            query: getFetchMoreQuery(query, { showNewsFilter }),
            variables: {
              ...queryVariables,
              offset: listItems.length
            },
            updateQuery: (prevResult, { fetchMoreResult }) => {
              if (!fetchMoreResult || !fetchMoreResult[query].length) return prevResult;

              return {
                ...prevResult,
                [query]: [...prevResult[query], ...fetchMoreResult[query]]
              };
            }
          });

        let ListHeaderComponent = null;

        if (showNewsFilter) {
          ListHeaderComponent = getListHeaderComponent(query, queryVariables, data, updateListData);
        }

        return (
          <SafeAreaViewFlex>
            <Component
              navigation={navigation}
              data={listItems}
              query={query}
              fetchMoreData={isConnected ? fetchMoreData : null}
              ListHeaderComponent={ListHeaderComponent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => refresh(refetch)}
                  colors={[colors.accent]}
                  tintColor={colors.accent}
                />
              }
            />
          </SafeAreaViewFlex>
        );
      }}
    </Query>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});

IndexScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon icon={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
