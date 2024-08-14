import { DeviceEventEmitter } from 'expo-modules-core';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';

import { ConfigurationsContext } from '../ConfigurationsProvider';
import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';
import {
  About,
  ConnectedImagesCarousel,
  Disturber,
  HomeSection,
  HomeService,
  ListComponent,
  NewsSectionPlaceholder,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Widgets,
  Wrapper,
  WrapperVertical
} from '../components';
import { colors, consts, texts } from '../config';
import { graphqlFetchPolicy, rootRouteName } from '../helpers';
import {
  useMatomoTrackScreenView,
  usePermanentFilter,
  usePushNotifications,
  useRedeemLocalVouchers,
  useStaticContent,
  useVersionCheck
} from '../hooks';
import { HOME_REFRESH_EVENT } from '../hooks/HomeRefresh';
import { QUERY_TYPES, getQueryType } from '../queries';
import { ScreenName } from '../types';

const { MATOMO_TRACKING, ROOT_ROUTE_NAMES } = consts;

const renderItem = ({ item }) => {
  const {
    buttonTitle,
    categoriesNews,
    fetchPolicy,
    limit,
    navigate,
    navigation,
    query,
    queryVariables,
    showData,
    showVolunteerEvents,
    title
  } = item;

  const NAVIGATION = {
    CATEGORIES_INDEX: {
      name: ScreenName.Index,
      params: {
        title,
        query: QUERY_TYPES.CATEGORIES,
        queryVariables: {},
        rootRouteName: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS
      }
    },
    EVENT_RECORDS_INDEX: {
      name: ScreenName.Index,
      params: {
        title,
        query: QUERY_TYPES.EVENT_RECORDS,
        queryVariables: { limit, order: 'listDate_ASC' },
        rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS
      }
    },
    NEWS_ITEMS_INDEX: ({
      categoryId,
      title,
      titleDetail,
      indexCategoryIds,
      rootRouteName = ROOT_ROUTE_NAMES.NEWS_ITEMS
    }) => {
      const indexQueryVariables = { limit };

      if (indexCategoryIds?.length) {
        indexQueryVariables.categoryIds = indexCategoryIds;
      } else {
        indexQueryVariables.categoryId = categoryId;
      }

      return {
        name: ScreenName.Index,
        params: {
          title,
          titleDetail,
          query: QUERY_TYPES.NEWS_ITEMS,
          queryVariables: indexQueryVariables,
          rootRouteName
        }
      };
    }
  };

  if (!showData) {
    return null;
  }

  if (categoriesNews?.length) {
    return categoriesNews.map(
      (
        {
          categoryButton: buttonTitle,
          categoryId,
          categoryTitle: title,
          categoryTitleDetail: titleDetail,
          indexCategoryIds,
          rootRouteName
        },
        index
      ) => (
        // eslint-disable-next-line react/jsx-key
        <HomeSection
          {...{
            buttonTitle,
            categoryId,
            fetchPolicy,
            key: index,
            navigation,
            navigate: () =>
              navigation.navigate(
                NAVIGATION.NEWS_ITEMS_INDEX({
                  categoryId,
                  title,
                  titleDetail,
                  indexCategoryIds,
                  rootRouteName
                })
              ),
            placeholder: <NewsSectionPlaceholder navigation={navigation} title={title} />,
            query,
            queryVariables: { ...queryVariables, categoryId },
            showVolunteerEvents,
            title,
            titleDetail
          }}
        />
      )
    );
  }

  return (
    <HomeSection
      {...{
        buttonTitle,
        fetchPolicy,
        isIndexStartingAt1: false,
        navigate: () => navigation.navigate(NAVIGATION[navigate]),
        navigation,
        query,
        queryVariables,
        showVolunteerEvents,
        title
      }}
    />
  );
};

export const HomeScreen = ({ navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { globalSettings } = useContext(SettingsContext);
  const { sections = {}, widgets: widgetConfigs = [], hdvt = {} } = globalSettings;
  const {
    staticContentList = {},
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
    buttonEvents = texts.homeButtons.events,
    limitEvents = 15,
    limitNews = 15,
    limitPointsOfInterestAndTours = 15
  } = sections;
  const {
    staticContentName = 'staticContentList',
    staticContentListDescription,
    horizontal = true,
    showStaticContentList = true,
    staticContentListTitle
  } = staticContentList;
  const { events: showVolunteerEvents = false } = hdvt;
  const [refreshing, setRefreshing] = useState(false);
  const { excludeDataProviderIds, excludeMowasRegionalKeys } = usePermanentFilter();

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

  useVersionCheck();
  useRedeemLocalVouchers();

  const { data: staticContentListData, refetch: staticContentListRefetch } = useStaticContent({
    refreshTimeKey: `publicJsonFile-${staticContentName}`,
    name: staticContentName,
    type: 'json',
    skip: !showStaticContentList
  });

  // function to add customized styles from `globalSettings` to the list items
  const staticContentListItem = useMemo(() => {
    if (!staticContentListData) {
      return [];
    }

    let listItem = staticContentListData;

    if (appDesignSystem?.staticContentList) {
      listItem = listItem?.map((item: any) => ({
        ...item,
        appDesignSystem: appDesignSystem.staticContentList
      }));
    }

    return listItem;
  }, [appDesignSystem, staticContentListData]);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.HOME);

  const refresh = () => {
    setRefreshing(true);

    // this will trigger the onRefresh functions provided to the `useHomeRefresh` hook in other
    // components.
    DeviceEventEmitter.emit(HOME_REFRESH_EVENT);

    // function required to make `contentList` refresh when the screen is refreshed
    staticContentListRefetch();

    // we simulate state change of `refreshing` with setting it to `true` first and after
    // a timeout to `false` again, which will result in a re-rendering of the screen.
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const data = [
    {
      categoriesNews,
      fetchPolicy,
      limit: limitNews,
      navigation,
      query: QUERY_TYPES.NEWS_ITEMS,
      queryVariables: { limit: 3, excludeDataProviderIds, excludeMowasRegionalKeys },
      showData: showNews
    },
    {
      buttonTitle: buttonPointsOfInterestAndTours,
      fetchPolicy,
      limit: limitPointsOfInterestAndTours,
      navigate: 'CATEGORIES_INDEX',
      navigation,
      query: QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS,
      queryVariables: { limit: 10, orderPoi: 'RAND', orderTour: 'RAND' },
      showData: showPointsOfInterestAndTours,
      title: headlinePointsOfInterestAndTours
    },
    {
      buttonTitle: buttonEvents,
      fetchPolicy,
      limit: limitEvents,
      navigate: 'EVENT_RECORDS_INDEX',
      navigation,
      query: QUERY_TYPES.EVENT_RECORDS,
      queryVariables: { limit: 3, order: 'listDate_ASC' },
      showData: showEvents,
      showVolunteerEvents,
      title: headlineEvents
    }
  ];

  return (
    <SafeAreaViewFlex>
      <FlatList
        data={data}
        ListHeaderComponent={
          <>
            <ConnectedImagesCarousel
              navigation={navigation}
              publicJsonFile="homeCarousel"
              refreshTimeKey="publicJsonFile-homeCarousel"
            />

            <Widgets widgetConfigs={widgetConfigs} />

            <Disturber navigation={navigation} publicJsonFile="homeDisturber" />
          </>
        }
        ListFooterComponent={
          <>
            {!!staticContentListItem?.length && (
              <>
                {!!staticContentListTitle && (
                  <WrapperVertical style={styles.noPaddingBottom}>
                    <SectionHeader title={staticContentListTitle} />
                  </WrapperVertical>
                )}

                {!!staticContentListDescription && (
                  <Wrapper>
                    <RegularText>{staticContentListDescription}</RegularText>
                  </Wrapper>
                )}

                <ListComponent
                  data={staticContentListItem}
                  horizontal={horizontal}
                  navigation={navigation}
                  query={QUERY_TYPES.STATIC_CONTENT_LIST}
                />
              </>
            )}

            {route.params?.isDrawer && (
              <>
                <HomeService publicJsonFile="homeService" />
                <About navigation={navigation} withHomeRefresh />
              </>
            )}
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
        renderItem={renderItem}
      />
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  noPaddingBottom: {
    paddingBottom: 0
  }
});

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
