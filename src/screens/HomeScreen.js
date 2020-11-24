import PropTypes from 'prop-types';
import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Query } from 'react-apollo';
import _shuffle from 'lodash/shuffle';
import _filter from 'lodash/filter';

import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';
import { auth } from '../auth';
import { colors, consts, device, normalize, texts } from '../config';
import {
  About,
  Button,
  CardList,
  HomeCarousel,
  Icon,
  ImageTextList,
  LoadingContainer,
  SafeAreaViewFlex,
  Service,
  TextList,
  Title,
  TitleContainer,
  TitleShadow,
  Touchable,
  VersionNumber,
  Wrapper,
  WrapperRow
} from '../components';
import { getQuery, getQueryType, QUERY_TYPES } from '../queries';
import {
  eventDate,
  graphqlFetchPolicy,
  mainImageOfMediaContents,
  momentFormat,
  shareMessage,
  subtitle
} from '../helpers';
import { useMatomoAlertOnStartUp, useMatomoTrackScreenView, usePushNotifications } from '../hooks';

const { DRAWER, LIST_TYPES, MATOMO_TRACKING } = consts;

const getListComponent = (listType) =>
  ({
    [LIST_TYPES.TEXT_LIST]: TextList,
    [LIST_TYPES.IMAGE_TEXT_LIST]: ImageTextList,
    [LIST_TYPES.CARD_LIST]: CardList
  }[listType]);

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
/* TODO: refactor news, pois & tours and events in single components */
export const HomeScreen = ({ navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const { globalSettings, listTypesSettings } = useContext(SettingsContext);
  const { sections = {} } = globalSettings;
  const {
    showNews = true,
    showPointsOfInterestAndTours = true,
    showEvents = true,
    categoriesNews = [
      {
        categoryTitle: texts.homeCategoriesNews.categoryTitle,
        categoryTitleDetail: texts.homeCategoriesNews.categoryTitleDetail,
        categoryButton: texts.homeButtons.news
      }
    ],
    headlinePointsOfInterestAndTours = texts.homeTitles.pointsOfInterest,
    buttonPointsOfInterestAndTours = texts.homeButtons.pointsOfInterest,
    headlineEvents = texts.homeTitles.events,
    buttonEvents = texts.homeButtons.events
  } = sections;
  const [refreshing, setRefreshing] = useState(false);

  const interactionHandler = useCallback(
    (response) => {
      const data = response?.notification?.request?.content?.data;
      const queryType = data?.query_type ? getQueryType(data.query_type) : undefined;

      if (data?.id && queryType) {
        // navigate to the newsItem
        navigation.navigate({
          routeName: 'Detail',
          params: {
            query: QUERY_TYPES.NEWS_ITEM,
            queryVariables: { id: data.id }
          }
        });
      }
    },
    [navigation]
  );

  usePushNotifications(undefined, interactionHandler);
  useMatomoAlertOnStartUp();
  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.HOME);

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
    NEWS_ITEMS_INDEX: ({ categoryId, categoryTitle }) => ({
      routeName: 'Index',
      params: {
        title: categoryTitle,
        query: QUERY_TYPES.NEWS_ITEMS,
        queryVariables: { limit: 15, ...{ categoryId } },
        rootRouteName: 'NewsItems'
      }
    })
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
        {showNews &&
          categoriesNews.map(
            ({ categoryId, categoryTitle, categoryTitleDetail, categoryButton }, index) => (
              <Fragment key={`${index}-${categoryTitle}`}>
                <TitleContainer>
                  <Touchable
                    onPress={() =>
                      navigation.navigate(
                        NAVIGATION.NEWS_ITEMS_INDEX({ categoryId, categoryTitle })
                      )
                    }
                  >
                    <Title accessibilityLabel={`${categoryTitle} (Überschrift) (Taste)`}>
                      {categoryTitle}
                    </Title>
                  </Touchable>
                </TitleContainer>
                {device.platform === 'ios' && <TitleShadow />}
                <Query
                  query={getQuery(QUERY_TYPES.NEWS_ITEMS)}
                  variables={{ limit: 3, ...{ categoryId } }}
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
                                mediaContent.contentType === 'image' ||
                                mediaContent.contentType === 'thumbnail'
                            )[0]?.sourceUrl?.url
                        },
                        routeName: 'Detail',
                        params: {
                          title: categoryTitleDetail,
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

                    const newsItemsListType = listTypesSettings[QUERY_TYPES.NEWS_ITEMS];
                    const ListComponent = getListComponent(newsItemsListType);

                    return (
                      <View>
                        <ListComponent
                          navigation={navigation}
                          data={newsItems}
                          leftImage={newsItemsListType === LIST_TYPES.IMAGE_TEXT_LIST}
                          horizontal={newsItemsListType === LIST_TYPES.CARD_LIST}
                        />

                        <Wrapper>
                          <Button
                            title={categoryButton}
                            onPress={() =>
                              navigation.navigate(
                                NAVIGATION.NEWS_ITEMS_INDEX({ categoryId, categoryTitle })
                              )
                            }
                          />
                        </Wrapper>
                      </View>
                    );
                  }}
                </Query>
              </Fragment>
            )
          )}

        {showPointsOfInterestAndTours && (
          <>
            <TitleContainer>
              <Touchable onPress={() => navigation.navigate(NAVIGATION.CATEGORIES_INDEX)}>
                <Title
                  accessibilityLabel={`${headlinePointsOfInterestAndTours} (Überschrift) (Taste)`}
                >
                  {headlinePointsOfInterestAndTours}
                </Title>
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
                    },
                    __typename: pointOfInterest.__typename
                  }));

                const tours =
                  data &&
                  data.tours &&
                  data.tours.map((tour) => ({
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
                    },
                    __typename: tour.__typename
                  }));

                const pointsOfInterestAndToursListType =
                  listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS];
                const ListComponent = getListComponent(pointsOfInterestAndToursListType);

                return (
                  <View>
                    <ListComponent
                      navigation={navigation}
                      data={_shuffle([...(pointsOfInterest || []), ...(tours || [])])}
                      leftImage={pointsOfInterestAndToursListType === LIST_TYPES.IMAGE_TEXT_LIST}
                      horizontal={pointsOfInterestAndToursListType === LIST_TYPES.CARD_LIST}
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
              <Touchable onPress={() => navigation.navigate(NAVIGATION.EVENT_RECORDS_INDEX)}>
                <Title accessibilityLabel={`${headlineEvents} (Überschrift) (Taste)`}>
                  {headlineEvents}
                </Title>
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
                    },
                    bottomDivider: index !== data.eventRecords.length - 1,
                    __typename: eventRecord.__typename
                  }));

                if (!eventRecords || !eventRecords.length) return null;

                const eventRecordsListType = listTypesSettings[QUERY_TYPES.EVENT_RECORDS];
                const ListComponent = getListComponent(eventRecordsListType);

                return (
                  <View>
                    <ListComponent
                      navigation={navigation}
                      data={eventRecords}
                      leftImage={eventRecordsListType === LIST_TYPES.IMAGE_TEXT_LIST}
                      horizontal={eventRecordsListType === LIST_TYPES.CARD_LIST}
                    />

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

        {globalSettings.navigation === DRAWER && (
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

const styles = StyleSheet.create({
  iconLeft: {
    paddingLeft: normalize(14),
    paddingRight: normalize(7)
  },
  iconRight: {
    paddingLeft: normalize(7),
    paddingRight: normalize(14)
  }
});

HomeScreen.navigationOptions = ({ navigation, navigationOptions }) => {
  const { headerRight } = navigationOptions;

  return {
    headerRight: (
      <WrapperRow>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Einstellungen (Taste)"
          accessibilityHint="Zu den Einstellungen wechseln"
        >
          <Icon
            name={device.platform === 'ios' ? 'ios-settings' : 'md-settings'}
            size={26}
            iconColor={colors.lightestText}
            style={headerRight ? styles.iconLeft : styles.iconRight}
          />
        </TouchableOpacity>
        {!!headerRight && headerRight}
      </WrapperRow>
    )
  };
};

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
