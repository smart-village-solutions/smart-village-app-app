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
import { useMatomo } from 'matomo-tracker-react-native';
import _filter from 'lodash/filter';

import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';
import { auth } from '../auth';
import { colors, consts, normalize } from '../config';
import {
  CardList,
  CategoryList,
  Icon,
  ImageTextList,
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
  matomoTrackingString,
  momentFormat,
  shareMessage,
  subtitle
} from '../helpers';

const { LIST_TYPES, MATOMO_TRACKING } = consts;

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
          subtitle: subtitle(
            eventDate(eventRecord.listDate),
            !!eventRecord.addresses &&
              !!eventRecord.addresses.length &&
              (eventRecord.addresses[0].addition || eventRecord.addresses[0].city)
          ),
          title: eventRecord.title,
          picture: {
            url: mainImageOfMediaContents(eventRecord.mediaContents)
          },
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
          subtitle: subtitle(
            momentFormat(newsItem.publishedAt),
            !!newsItem.dataProvider && newsItem.dataProvider.name
          ),
          title:
            !!newsItem.contentBlocks &&
            !!newsItem.contentBlocks.length &&
            newsItem.contentBlocks[0].title,
          picture: {
            url:
              !!newsItem.contentBlocks &&
              !!newsItem.contentBlocks.length &&
              !!newsItem.contentBlocks[0].mediaContents &&
              !!newsItem.contentBlocks[0].mediaContents.length &&
              _filter(
                newsItem.contentBlocks[0].mediaContents,
                (mediaContent) =>
                  mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
              )[0].sourceUrl.url
          },
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
          title: pointOfInterest.name,
          subtitle: !!pointOfInterest.category && pointOfInterest.category.name,
          picture: {
            url: mainImageOfMediaContents(pointOfInterest.mediaContents)
          },
          routeName: 'Detail',
          params: {
            title: 'Ort',
            query: QUERY_TYPES.POINT_OF_INTEREST,
            queryVariables: { id: `${pointOfInterest.id}` },
            rootRouteName: 'PointsOfInterest',
            shareContent: {
              message: shareMessage(pointOfInterest, QUERY_TYPES.POINT_OF_INTEREST)
            },
            details: {
              ...pointOfInterest,
              title: pointOfInterest.name
            }
          }
        }))
    );
  case QUERY_TYPES.TOURS:
    return (
      data &&
        data[query] &&
        data[query].map((tour) => ({
          id: tour.id,
          title: tour.name,
          subtitle: !!tour.category && tour.category.name,
          picture: {
            url: mainImageOfMediaContents(tour.mediaContents)
          },
          routeName: 'Detail',
          params: {
            title: 'Tour',
            query: QUERY_TYPES.TOUR,
            queryVariables: { id: `${tour.id}` },
            rootRouteName: 'Tours',
            shareContent: {
              message: shareMessage(tour, QUERY_TYPES.TOUR)
            },
            details: {
              ...tour,
              title: tour.name
            }
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

const getListComponent = (listType) =>
  ({
    [LIST_TYPES.TEXT_LIST]: TextList,
    [LIST_TYPES.IMAGE_TEXT_LIST]: ImageTextList,
    [LIST_TYPES.CARD_LIST]: CardList
  }[listType]);

const getComponent = (query, listTypesSettings) => {
  const COMPONENTS = {
    [QUERY_TYPES.NEWS_ITEMS]: getListComponent(listTypesSettings[QUERY_TYPES.NEWS_ITEMS]),
    [QUERY_TYPES.EVENT_RECORDS]: getListComponent(listTypesSettings[QUERY_TYPES.EVENT_RECORDS]),
    [QUERY_TYPES.POINTS_OF_INTEREST]: getListComponent(
      listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS]
    ),
    [QUERY_TYPES.TOURS]: getListComponent(
      listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS]
    ),
    [QUERY_TYPES.CATEGORIES]: CategoryList
  };

  return COMPONENTS[query];
};

export const IndexScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { listTypesSettings } = useContext(SettingsContext);
  const query = navigation.getParam('query', '');
  const title = navigation.getParam('title', '');
  const [queryVariables, setQueryVariables] = useState(navigation.getParam('queryVariables', {}));
  const [refreshing, setRefreshing] = useState(false);
  const { trackScreenView } = useMatomo();

  useEffect(() => {
    isConnected && auth();
  }, []);

  useEffect(() => {
    // we want to ensure when changing from one index screen to another, for example from
    // news to events, that the query variables are taken freshly. otherwise the mounted screen can
    // have query variables from the previous screen, that does not work. this can result in an
    // empty screen because the query is not retuning anything.
    setQueryVariables(navigation.getParam('queryVariables', {}));

    if (query) {
      const MATOMO_TRACKING_SCREEN = {
        [QUERY_TYPES.EVENT_RECORDS]: MATOMO_TRACKING.SCREEN_VIEW.EVENT_RECORDS,
        [QUERY_TYPES.NEWS_ITEMS]: MATOMO_TRACKING.SCREEN_VIEW.NEWS_ITEMS,
        [QUERY_TYPES.POINTS_OF_INTEREST]: MATOMO_TRACKING.SCREEN_VIEW.POINTS_OF_INTEREST,
        [QUERY_TYPES.TOURS]: MATOMO_TRACKING.SCREEN_VIEW.TOURS,
        [QUERY_TYPES.CATEGORIES]: MATOMO_TRACKING.SCREEN_VIEW.POINTS_OF_INTEREST_AND_TOURS
      }[query];

      // in some cases we want to apply more information to the tracking string
      const MATOMO_TRACKING_CATEGORY = {
        [QUERY_TYPES.EVENT_RECORDS]: null,
        [QUERY_TYPES.NEWS_ITEMS]: title, // the title should be the category of news
        [QUERY_TYPES.POINTS_OF_INTEREST]: null,
        [QUERY_TYPES.TOURS]: null,
        [QUERY_TYPES.CATEGORIES]: null
      }[query];

      // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `query`
      //       dependency
      isConnected &&
        trackScreenView(matomoTrackingString([MATOMO_TRACKING_SCREEN, MATOMO_TRACKING_CATEGORY]));
    }
  }, [query]);

  if (!query) return null;

  const refresh = async (refetch) => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const { globalSettings } = useContext(SettingsContext);
  const { filter = {} } = globalSettings;
  const { news: showNewsFilter = false, events: showEventsFilter = true } = filter;
  const Component = getComponent(query, listTypesSettings);
  const showFilter = {
    [QUERY_TYPES.EVENT_RECORDS]: showEventsFilter,
    [QUERY_TYPES.NEWS_ITEMS]: showNewsFilter
  }[query];
  const queryVariableForQuery = {
    [QUERY_TYPES.EVENT_RECORDS]: 'categoryId',
    [QUERY_TYPES.NEWS_ITEMS]: 'dataProvider'
  }[query];

  const updateListData = (selectedValue) => {
    if (selectedValue) {
      // remove a refetch key if present, which was necessary for the "- Alle -" selection
      delete queryVariables.refetch;

      setQueryVariables({
        ...queryVariables,
        [queryVariableForQuery]: selectedValue
      });
    } else {
      setQueryVariables((prevQueryVariables) => {
        // remove the filter key for the specific query, when selecting "- Alle -"
        delete prevQueryVariables[queryVariableForQuery];
        // need to spread the `prevQueryVariables` into a new object with additional refetch key
        // to force the Query component to update the data, otherwise it is not fired somehow
        // because the state variable wouldn't change
        return { ...prevQueryVariables, refetch: true };
      });
    }
  };

  return (
    <Query
      query={getQuery(query, { showNewsFilter, showEventsFilter })}
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
            query: getFetchMoreQuery(query),
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

        if (showFilter) {
          ListHeaderComponent = <ListHeader {...{ query, queryVariables, data, updateListData }} />;
        }

        return (
          <SafeAreaViewFlex style={styles.center}>
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Zurück Taste"
          accessibilityHint="Navigieren zurück zur vorherigen Seite"
        >
          <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
