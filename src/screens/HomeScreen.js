import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { Query } from 'react-apollo';
import _shuffle from 'lodash/shuffle';

import { NetworkContext } from '../NetworkProvider';
import { GlobalSettingsContext } from '../GlobalSettingsProvider';
import { auth } from '../auth';
import { colors, consts, device, texts } from '../config';
import {
  About,
  Button,
  CardList,
  HomeCarousel,
  LoadingContainer,
  SafeAreaViewFlex,
  Service,
  TextList,
  Title,
  TitleContainer,
  TitleShadow,
  Touchable,
  VersionNumber,
  Wrapper
} from '../components';
import { getQuery, QUERY_TYPES } from '../queries';
import {
  eventDate,
  graphqlFetchPolicy,
  mainImageOfMediaContents,
  momentFormat,
  shareMessage
} from '../helpers';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
/* TODO: refactor news, pois & tours and events in single components */
export const HomeScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const globalSettings = useContext(GlobalSettingsContext);
  const { sections = {} } = globalSettings;
  const {
    showNews = true,
    showPointsOfInterestAndTours = true,
    showEvents = true,
    headlineNews = texts.homeTitles.news,
    buttonNews = texts.homeButtons.news,
    headlinePointsOfInterestAndTours = texts.homeTitles.pointsOfInterest,
    buttonPointsOfInterestAndTours = texts.homeButtons.pointsOfInterest,
    headlineEvents = texts.homeTitles.events,
    buttonEvents = texts.homeButtons.events
  } = sections;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    isConnected && auth();
  }, []);

  const refresh = () => {
    setRefreshing(true);
    // for refetching data on the home screen we need to re-render the whole screen,
    // in order to re-run every existing query.
    // there is no solution to call the Apollo `refetch` for every `Query` component.
    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const NAVIGATION = {
    CATEGORIES_INDEX: {
      routeName: 'Index',
      params: {
        title: 'Touren und Orte',
        query: QUERY_TYPES.CATEGORIES,
        queryVariables: {},
        rootRouteName: 'PointsOfInterestAndTours'
      }
    },
    EVENT_RECORDS_INDEX: {
      routeName: 'Index',
      params: {
        title: 'Veranstaltungen',
        query: QUERY_TYPES.EVENT_RECORDS,
        queryVariables: { limit: 15, order: 'listDate_ASC' },
        rootRouteName: 'EventRecords'
      }
    },
    NEWS_ITEMS_INDEX: {
      routeName: 'Index',
      params: {
        title: 'Nachrichten',
        query: QUERY_TYPES.NEWS_ITEMS,
        queryVariables: { limit: 15 },
        rootRouteName: 'NewsItems'
      }
    }
  };

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <HomeCarousel navigation={navigation} />

        {showNews && (
          <>
            <TitleContainer>
              <Touchable
                accessibilityLabel={`${headlineNews} (Überschrift) (Taste)`}
                onPress={() => navigation.navigate(NAVIGATION.NEWS_ITEMS_INDEX)}
              >
                <Title>{headlineNews}</Title>
              </Touchable>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Query
              query={getQuery(QUERY_TYPES.NEWS_ITEMS)}
              variables={{ limit: 3 }}
              fetchPolicy={fetchPolicy}
            >
              {({ data, loading }) => {
                if (loading) {
                  return (
                    <LoadingContainer>
                      <ActivityIndicator color={colors.accent} />
                    </LoadingContainer>
                  );
                }

                const newsItems =
                  data &&
                  data.newsItems &&
                  data.newsItems.map((newsItem, index) => ({
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
                    },
                    bottomDivider: index !== data.newsItems.length - 1,
                    __typename: newsItem.__typename
                  }));

                if (!newsItems || !newsItems.length) return null;

                return (
                  <View>
                    <TextList navigation={navigation} data={newsItems} />

                    <Wrapper>
                      <Button
                        title={buttonNews}
                        onPress={() => navigation.navigate(NAVIGATION.NEWS_ITEMS_INDEX)}
                      />
                    </Wrapper>
                  </View>
                );
              }}
            </Query>
          </>
        )}

        {showPointsOfInterestAndTours && (
          <>
            <TitleContainer>
              <Touchable
                accessibilityLabel={`${headlinePointsOfInterestAndTours} (Überschrift) (Taste)`}
                onPress={() => navigation.navigate(NAVIGATION.CATEGORIES_INDEX)}
              >
                <Title>{headlinePointsOfInterestAndTours}</Title>
              </Touchable>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Query
              query={getQuery(QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS)}
              variables={{ limit: 10, orderPoi: 'RAND', orderTour: 'RAND' }}
              fetchPolicy={fetchPolicy}
            >
              {({ data, loading }) => {
                if (loading) {
                  return (
                    <LoadingContainer>
                      <ActivityIndicator color={colors.accent} />
                    </LoadingContainer>
                  );
                }

                const pointsOfInterest =
                  data &&
                  data.pointsOfInterest &&
                  data.pointsOfInterest.map((pointOfInterest) => ({
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
                    },
                    __typename: pointOfInterest.__typename
                  }));

                const tours =
                  data &&
                  data.tours &&
                  data.tours.map((tour) => ({
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
                    },
                    __typename: tour.__typename
                  }));

                return (
                  <View>
                    <CardList
                      navigation={navigation}
                      data={_shuffle([...(pointsOfInterest || []), ...(tours || [])])}
                      horizontal
                    />

                    <Wrapper>
                      <Button
                        title={buttonPointsOfInterestAndTours}
                        onPress={() => navigation.navigate(NAVIGATION.CATEGORIES_INDEX)}
                      />
                    </Wrapper>
                  </View>
                );
              }}
            </Query>
          </>
        )}

        {showEvents && (
          <>
            <TitleContainer>
              <Touchable
                accessibilityLabel={`${headlineEvents} (Überschrift) (Taste)`}
                onPress={() => navigation.navigate(NAVIGATION.EVENT_RECORDS_INDEX)}
              >
                <Title>{headlineEvents}</Title>
              </Touchable>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Query
              query={getQuery(QUERY_TYPES.EVENT_RECORDS)}
              variables={{ limit: 3, order: 'listDate_ASC' }}
              fetchPolicy={fetchPolicy}
            >
              {({ data, loading }) => {
                if (loading) {
                  return (
                    <LoadingContainer>
                      <ActivityIndicator color={colors.accent} />
                    </LoadingContainer>
                  );
                }

                const eventRecords =
                  data &&
                  data.eventRecords &&
                  data.eventRecords.map((eventRecord, index) => ({
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
                    },
                    bottomDivider: index !== data.eventRecords.length - 1,
                    __typename: eventRecord.__typename
                  }));

                if (!eventRecords || !eventRecords.length) return null;

                return (
                  <View>
                    <TextList navigation={navigation} data={eventRecords} />

                    <Wrapper>
                      <Button
                        title={buttonEvents}
                        onPress={() => navigation.navigate(NAVIGATION.EVENT_RECORDS_INDEX)}
                      />
                    </Wrapper>
                  </View>
                );
              }}
            </Query>
          </>
        )}

        {globalSettings.navigation === consts.DRAWER && (
          <>
            <Service navigation={navigation} refreshing={refreshing} />
            <About navigation={navigation} refreshing={refreshing} />
            <VersionNumber />
          </>
        )}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
