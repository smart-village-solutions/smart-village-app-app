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

import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';
import { auth } from '../auth';
import { colors, consts, device, normalize, texts } from '../config';
import {
  About,
  Button,
  HomeCarousel,
  Icon,
  ListComponent,
  LoadingContainer,
  SafeAreaViewFlex,
  Service,
  Title,
  TitleContainer,
  TitleShadow,
  Touchable,
  VersionNumber,
  Wrapper,
  WrapperRow
} from '../components';
import {
  graphqlFetchPolicy,
  parseEventRecords,
  parseNewsItems,
  parsePointOfInterest,
  parseTours,
  rootRouteName
} from '../helpers';
import { useMatomoAlertOnStartUp, useMatomoTrackScreenView, usePushNotifications } from '../hooks';
import { getQuery, getQueryType, QUERY_TYPES } from '../queries';
import { favSettings } from '../icons';

const { DRAWER, LIST_TYPES, MATOMO_TRACKING, ROOT_ROUTE_NAMES } = consts;

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
            title: texts.detailTitles[queryType],
            query: queryType,
            queryVariables: { id: data.id },
            rootRouteName: rootRouteName(queryType),
            shareContent: null,
            details: null
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
        rootRouteName: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS
      }
    },
    EVENT_RECORDS_INDEX: {
      routeName: 'Index',
      params: {
        title: 'Veranstaltungen',
        query: QUERY_TYPES.EVENT_RECORDS,
        queryVariables: { limit: 15, order: 'listDate_ASC' },
        rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS
      }
    },
    NEWS_ITEMS_INDEX: ({ categoryId, categoryTitle, categoryTitleDetail }) => ({
      routeName: 'Index',
      params: {
        title: categoryTitle,
        titleDetail: categoryTitleDetail,
        query: QUERY_TYPES.NEWS_ITEMS,
        queryVariables: { limit: 15, ...{ categoryId } },
        rootRouteName: ROOT_ROUTE_NAMES.NEWS_ITEMS
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
                        NAVIGATION.NEWS_ITEMS_INDEX({
                          categoryId,
                          categoryTitle,
                          categoryTitleDetail
                        })
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

                    const newsItems = parseNewsItems(
                      data?.[QUERY_TYPES.NEWS_ITEMS],
                      true,
                      categoryTitleDetail
                    );

                    if (!newsItems || !newsItems.length) return null;

                    const newsItemsListType = listTypesSettings[QUERY_TYPES.NEWS_ITEMS];

                    return (
                      <View>
                        <ListComponent
                          navigation={navigation}
                          data={newsItems}
                          query={QUERY_TYPES.NEWS_ITEMS}
                          horizontal={newsItemsListType === LIST_TYPES.CARD_LIST}
                        />

                        <Wrapper>
                          <Button
                            title={categoryButton}
                            onPress={() =>
                              navigation.navigate(
                                NAVIGATION.NEWS_ITEMS_INDEX({
                                  categoryId,
                                  categoryTitle,
                                  categoryTitleDetail
                                })
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

                const pointsOfInterest = parsePointOfInterest(
                  data?.[QUERY_TYPES.POINTS_OF_INTEREST]
                );

                const tours = parseTours(data?.[QUERY_TYPES.TOURS]);

                const pointsOfInterestAndToursListType =
                  listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS];

                return (
                  <View>
                    <ListComponent
                      navigation={navigation}
                      data={_shuffle([...(pointsOfInterest || []), ...(tours || [])])}
                      query={QUERY_TYPES.POINTS_OF_INTEREST}
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

                const eventRecords = parseEventRecords(data?.[QUERY_TYPES.EVENT_RECORDS], true);

                if (!eventRecords || !eventRecords.length) return null;

                const eventRecordsListType = listTypesSettings[QUERY_TYPES.EVENT_RECORDS];

                return (
                  <View>
                    <ListComponent
                      navigation={navigation}
                      data={eventRecords}
                      query={QUERY_TYPES.EVENT_RECORDS}
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
    paddingRight: normalize(7),
    paddingVertical: normalize(4)
  },
  iconRight: {
    paddingLeft: normalize(7),
    paddingRight: normalize(14),
    paddingVertical: normalize(4)
  }
});

HomeScreen.navigationOptions = ({ navigation, navigationOptions }) => {
  const { headerRight } = navigationOptions;

  return {
    headerLeft: (
      <WrapperRow>
        <TouchableOpacity
          onPress={() => navigation.navigate('Bookmarks')}
          accessibilityLabel="Einstellungen (Taste)"
          accessibilityHint="Zu den Einstellungen wechseln"
        >
          <Icon
            size={26}
            style={headerRight ? styles.iconLeft : styles.iconRight}
            xml={favSettings(colors.lightestText)}
          />
        </TouchableOpacity>
      </WrapperRow>
    )
  };
};

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
