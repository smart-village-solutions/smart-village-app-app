import { DeviceEventEmitter } from 'expo-modules-core';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { auth } from '../auth';
import {
  About,
  ConnectedImagesCarousel,
  HomeSection,
  SafeAreaViewFlex,
  Service,
  Widgets
} from '../components';
import { colors, consts, texts } from '../config';
import { graphqlFetchPolicy, rootRouteName } from '../helpers';
import { useMatomoTrackScreenView, usePushNotifications, useTrackAppStart } from '../hooks';
import { HOME_REFRESH_EVENT } from '../hooks/HomeRefresh';
import { NetworkContext } from '../NetworkProvider';
import { getQueryType, QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

const { MATOMO_TRACKING, ROOT_ROUTE_NAMES } = consts;

export const HomeScreen = ({ navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const { globalSettings } = useContext(SettingsContext);
  const { sections = {}, widgets: widgetConfigs } = globalSettings;
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
        // navigate to the referenced item
        navigation.navigate({
          name: 'Detail',
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

  usePushNotifications(
    undefined,
    interactionHandler,
    undefined,
    globalSettings?.settings?.pushNotifications
  );

  useTrackAppStart();
  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.HOME);

  useEffect(() => {
    isConnected && auth();
  }, []);

  const refresh = () => {
    setRefreshing(true);

    // this will trigger the onRefresh functions provided to the useHomeRefresh hook in other
    // components.
    DeviceEventEmitter.emit(HOME_REFRESH_EVENT);

    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const NAVIGATION = {
    CATEGORIES_INDEX: {
      name: 'Index',
      params: {
        title: headlinePointsOfInterestAndTours,
        query: QUERY_TYPES.CATEGORIES,
        queryVariables: {},
        rootRouteName: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS
      }
    },
    EVENT_RECORDS_INDEX: {
      name: 'Index',
      params: {
        title: headlineEvents,
        query: QUERY_TYPES.EVENT_RECORDS,
        queryVariables: { limit: 15, order: 'listDate_ASC' },
        rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS
      }
    },
    NEWS_ITEMS_INDEX: ({ categoryId, categoryTitle, categoryTitleDetail, rootRouteName }) => ({
      name: 'Index',
      params: {
        title: categoryTitle,
        titleDetail: categoryTitleDetail,
        query: QUERY_TYPES.NEWS_ITEMS,
        queryVariables: { limit: 15, ...{ categoryId } },
        rootRouteName: rootRouteName || ROOT_ROUTE_NAMES.NEWS_ITEMS
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
        <ConnectedImagesCarousel
          alternateAspectRatio
          navigation={navigation}
          publicJsonFile="homeCarousel"
          refreshTimeKey="publicJsonFile-homeCarousel"
        />
        <Widgets widgetConfigs={widgetConfigs} />

        {showNews &&
          categoriesNews.map(
            (
              { categoryButton, categoryId, categoryTitle, categoryTitleDetail, rootRouteName },
              index
            ) => (
              <HomeSection
                key={index}
                buttonTitle={categoryButton}
                categoryId={categoryId}
                title={categoryTitle}
                titleDetail={categoryTitleDetail}
                fetchPolicy={fetchPolicy}
                navigate={() =>
                  navigation.navigate(
                    NAVIGATION.NEWS_ITEMS_INDEX({
                      categoryId,
                      categoryTitle,
                      categoryTitleDetail,
                      rootRouteName
                    })
                  )
                }
                navigation={navigation}
                query={QUERY_TYPES.NEWS_ITEMS}
                queryVariables={{ limit: 3, ...{ categoryId } }}
              />
            )
          )}

        {showPointsOfInterestAndTours && (
          <HomeSection
            buttonTitle={buttonPointsOfInterestAndTours}
            title={headlinePointsOfInterestAndTours}
            fetchPolicy={fetchPolicy}
            navigate={() => navigation.navigate(NAVIGATION.CATEGORIES_INDEX)}
            navigation={navigation}
            query={QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS}
            queryVariables={{ limit: 10, orderPoi: 'RAND', orderTour: 'RAND' }}
          />
        )}

        {showEvents && (
          <HomeSection
            buttonTitle={buttonEvents}
            title={headlineEvents}
            navigate={() => navigation.navigate(NAVIGATION.EVENT_RECORDS_INDEX)}
            navigation={navigation}
            query={QUERY_TYPES.EVENT_RECORDS}
            queryVariables={{ limit: 3, order: 'listDate_ASC' }}
            fetchPolicy={fetchPolicy}
          />
        )}
        {route.params?.isDrawer && (
          <>
            <Service navigation={navigation} />
            <About navigation={navigation} withHomeRefresh />
          </>
        )}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
