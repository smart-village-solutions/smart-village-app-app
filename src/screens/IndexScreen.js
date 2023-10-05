import { useFocusEffect } from '@react-navigation/native';
import _sortBy from 'lodash/sortBy';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { Divider } from 'react-native-elements';

import {
  Button,
  Calendar,
  CalendarListToggle,
  CategoryList,
  DropdownHeader,
  EmptyMessage,
  HeaderLeft,
  HtmlView,
  IndexFilterWrapperAndList,
  IndexMapSwitch,
  ListComponent,
  LoadingContainer,
  LocationOverview,
  OptionToggle,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../components';
import { colors, consts, Icon, normalize, texts } from '../config';
import {
  graphqlFetchPolicy,
  isOpen,
  matomoTrackingString,
  openLink,
  parseListItemsFromQuery,
  sortPOIsByDistanceFromPosition
} from '../helpers';
import {
  useOpenWebScreen,
  usePermanentFilter,
  usePosition,
  useStaticContent,
  useTrackScreenViewAsync,
  useVolunteerData
} from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { getFetchMoreQuery, getQuery, QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

const { MATOMO_TRACKING } = consts;

const FILTER_TYPES = {
  LIST: 'list',
  MAP: 'map'
};

export const SWITCH_BETWEEN_LIST_AND_MAP = {
  TOP_FILTER: 'top-filter',
  BOTTOM_FLOATING_BUTTON: 'bottom-floating-button'
};

const isMapSelected = (query, topFilter) =>
  query === QUERY_TYPES.POINTS_OF_INTEREST &&
  topFilter.find((entry) => entry.selected).id === FILTER_TYPES.MAP;

const keyForSelectedValueByQuery = (query, isLocationFilter) => {
  const QUERIES = {
    [QUERY_TYPES.EVENT_RECORDS]: isLocationFilter ? 'location' : 'categoryId',
    [QUERY_TYPES.NEWS_ITEMS]: 'dataProvider'
  };

  return QUERIES[query];
};

const getAdditionalQueryVariables = (
  query,
  selectedValue,
  excludeDataProviderIds,
  isLocationFilter
) => {
  const keyForSelectedValue = keyForSelectedValueByQuery(query, isLocationFilter);
  const additionalQueryVariables = {};

  if (selectedValue) {
    additionalQueryVariables[keyForSelectedValue] = selectedValue;
  }

  if (excludeDataProviderIds?.length) {
    additionalQueryVariables.excludeDataProviderIds = excludeDataProviderIds;
  }

  return additionalQueryVariables;
};

const currentDate = moment().format('YYYY-MM-DD');

/* eslint-disable complexity */
// TODO: make a list component for POIs that already includes the mapswitchheader?
// TODO: make a list component that already includes the news/events filter?
export const IndexScreen = ({ navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { filter = {}, hdvt = {}, settings = {}, sections = {} } = globalSettings;
  const {
    news: showNewsFilter = false,
    events: showEventsFilter = true,
    eventLocations: showEventLocationsFilter = false
  } = filter;
  const { events: showVolunteerEvents = false } = hdvt;
  const {
    calendarToggle = false,
    showFilterByOpeningTimes = true,
    switchBetweenListAndMap = SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER
  } = settings;
  const {
    categoryListIntroText = texts.categoryList.intro,
    categoryListFooter,
    categoryTitles,
    eventListIntro,
    poiListIntro
  } = sections;
  const { initialFilter = FILTER_TYPES.LIST } = route.params?.queryVariables ?? {};
  const INITIAL_FILTER = [
    {
      id: FILTER_TYPES.LIST,
      title: texts.locationOverview.list,
      selected: initialFilter == FILTER_TYPES.LIST
    },
    {
      id: FILTER_TYPES.MAP,
      title: texts.locationOverview.map,
      selected: initialFilter == FILTER_TYPES.MAP
    }
  ];
  const [filterType, setFilterType] = useState(INITIAL_FILTER);
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables ?? {});
  const [showCalendar, setShowCalendar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const trackScreenViewAsync = useTrackScreenViewAsync();
  const [filterByOpeningTimes, setFilterByOpeningTimes] = useState(false);
  const [filterByDailyEvents, setFilterByDailyEvents] = useState(
    route.params?.filterByDailyEvents ?? false
  );
  const { state: excludeDataProviderIds } = usePermanentFilter();

  const query = route.params?.query ?? '';

  const showMap = isMapSelected(query, filterType);

  // we currently only require the position for POIs
  const sortByDistance = query === QUERY_TYPES.POINTS_OF_INTEREST;

  const { loading: loadingPosition, position } = usePosition(!sortByDistance);

  const title = route.params?.title ?? '';
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
  const categories = route.params?.categories;
  const showFilter =
    (route.params?.showFilter ?? true) &&
    {
      [QUERY_TYPES.EVENT_RECORDS]: showEventsFilter,
      [QUERY_TYPES.NEWS_ITEMS]: showNewsFilter
    }[query];
  const htmlContentName =
    query === QUERY_TYPES.POINTS_OF_INTEREST && poiListIntro?.[queryVariables.category];

  const { data: htmlContent } = useStaticContent({
    name: htmlContentName,
    type: 'html',
    refreshTimeKey: `${query}-${queryVariables.category}`,
    skip: !htmlContentName
  });

  const openWebScreenUrl = eventListIntro?.url || categoryListFooter?.url;
  const openWebScreen = useOpenWebScreen(title, openWebScreenUrl);

  const hasFilterSelection = useCallback(
    (query, isLocationFilter) => {
      return !!Object.prototype.hasOwnProperty.call(queryVariables, [
        keyForSelectedValueByQuery(query, isLocationFilter)
      ]);
    },
    [queryVariables]
  );

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  const { data, loading, fetchMore, refetch } = useQuery(
    getQuery(query, { showNewsFilter, showEventsFilter }),
    {
      variables: queryVariables,
      fetchPolicy
    }
  );

  const { data: eventRecordsAddressesData, loading: eventRecordsAddressesLoading } = useQuery(
    getQuery(QUERY_TYPES.EVENT_RECORDS_ADDRESSES),
    {
      skip: !showEventLocationsFilter
    }
  );

  const hasDailyFilterSelection = !!queryVariables.dateRange;

  const buildListItems = useCallback(
    (data, additionalData) => {
      let listItems = parseListItemsFromQuery(query, data, titleDetail, {
        bookmarkable,
        withDate: false,
        queryVariables
      });

      if (additionalData?.length) {
        if (hasDailyFilterSelection) {
          // filter additionalData on given or current day
          additionalData = additionalData.filter(
            (item) => item.listDate === (queryVariables.dateRange?.[0] ?? currentDate)
          );
        }

        listItems.push(...additionalData);
        listItems = _sortBy(listItems, (item) => item.listDate);
      }

      if (filterByOpeningTimes) {
        listItems = listItems?.filter((entry) => isOpen(entry.params?.details?.openingHours)?.open);
      }

      if (sortByDistance && position && listItems?.length) {
        listItems = sortPOIsByDistanceFromPosition(listItems, position.coords);
      }

      return listItems;
    },
    [query, queryVariables, filterByOpeningTimes, sortByDistance, position]
  );

  const updateListDataByDropdown = useCallback(
    (selectedValue, isLocationFilter) => {
      if (selectedValue) {
        setQueryVariables((prevQueryVariables) => {
          // remove a refetch key if present, which was necessary for the "- Alle -" selection
          delete prevQueryVariables.refetch;

          return {
            ...prevQueryVariables,
            ...getAdditionalQueryVariables(
              query,
              selectedValue,
              excludeDataProviderIds,
              isLocationFilter
            )
          };
        });
      } else {
        if (hasFilterSelection(query, isLocationFilter)) {
          setQueryVariables((prevQueryVariables) => {
            // remove the filter key for the specific query if present, when selecting "- Alle -"
            delete prevQueryVariables[keyForSelectedValueByQuery(query, isLocationFilter)];

            // need to spread the prior `queryVariables` into a new object with additional
            // refetch key to force the Query component to update the data, otherwise it is
            // not fired somehow because the state variable wouldn't change
            return { ...prevQueryVariables, refetch: true };
          });
        }
      }
    },
    [query, queryVariables, excludeDataProviderIds]
  );

  const updateListDataByDailySwitch = useCallback(() => {
    // update switch state as well
    setFilterByDailyEvents((oldSwitchValue) => {
      // if `oldSwitchValue` was false, we now activate the daily filter and set a date range
      if (!oldSwitchValue) {
        setQueryVariables((prevQueryVariables) => {
          // remove a refetch key if present, which was necessary for unselecting daily events
          delete prevQueryVariables.refetchDate;

          // add the filter key for the specific query, when filtering for daily events
          return { ...prevQueryVariables, dateRange: [currentDate, currentDate] };
        });
        setShowCalendar(false);
      } else {
        setQueryVariables((prevQueryVariables) => {
          // remove the filter key for the specific query, when unselecting daily events
          delete prevQueryVariables.dateRange;

          // need to spread the `prevQueryVariables` into a new object with additional refetchDate
          // key to force the Query component to update the data, otherwise it is not fired somehow
          // because the state variable wouldn't change
          return { ...prevQueryVariables, refetchDate: true };
        });
      }

      return !oldSwitchValue;
    });
  }, [filterByDailyEvents, queryVariables]);

  // if we show the map, calendar or want to sort by distance, we need to fetch all the entries at
  // once this is not a big issue if we want to sort by distance, because getting the location
  // usually takes longer than fetching all entries if we filter by opening times, we need to also
  // remove the limit as otherwise we might not have any open POIs in the next batch that would
  // result in the list not getting any new items and not reliably triggering another `fetchMore`
  if (showMap || showCalendar || sortByDistance || filterByOpeningTimes) {
    delete queryVariables.limit;
  }

  useEffect(() => {
    // we want to ensure when changing from one index screen to another, for example from
    // news to events, that the query variables are taken freshly. otherwise the mounted screen can
    // have query variables from the previous screen, that does not work. this can result in an
    // empty screen because the query is not returning anything.
    setQueryVariables({
      ...(route.params?.queryVariables ?? {}),
      ...getAdditionalQueryVariables(query, undefined, excludeDataProviderIds, undefined)
    });
    // reset daily events filter as well when navigating from one index screen to a new events index
    setFilterByDailyEvents(route.params?.filterByDailyEvents);
    // reset some of the navigation params for some reason
    navigation.setParams({
      filterByDailyEvents: false,
      titleDetail: query === QUERY_TYPES.NEWS_ITEMS ? route.params?.titleDetail : ''
    });
  }, [route.params?.queryVariables, query, excludeDataProviderIds]);

  useEffect(() => {
    if (query) {
      const MATOMO_TRACKING_SCREEN = {
        [QUERY_TYPES.EVENT_RECORDS]: MATOMO_TRACKING.SCREEN_VIEW.EVENT_RECORDS,
        [QUERY_TYPES.GENERIC_ITEMS]: MATOMO_TRACKING.SCREEN_VIEW.GENERIC_ITEMS,
        [QUERY_TYPES.NEWS_ITEMS]: MATOMO_TRACKING.SCREEN_VIEW.NEWS_ITEMS,
        [QUERY_TYPES.POINTS_OF_INTEREST]: MATOMO_TRACKING.SCREEN_VIEW.POINTS_OF_INTEREST,
        [QUERY_TYPES.TOURS]: MATOMO_TRACKING.SCREEN_VIEW.TOURS,
        [QUERY_TYPES.CATEGORIES]: MATOMO_TRACKING.SCREEN_VIEW.POINTS_OF_INTEREST_AND_TOURS
      }[query];

      // in some cases we want to apply more information to the tracking string
      const MATOMO_TRACKING_CATEGORY = {
        [QUERY_TYPES.EVENT_RECORDS]: null,
        [QUERY_TYPES.GENERIC_ITEMS]: title, // the title should be the type of the generic items
        [QUERY_TYPES.NEWS_ITEMS]: title, // the title should be the category of news
        [QUERY_TYPES.POINTS_OF_INTEREST]: null,
        [QUERY_TYPES.TOURS]: null,
        [QUERY_TYPES.CATEGORIES]: null
      }[query];

      // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `query`
      //       dependency
      isConnected &&
        trackScreenViewAsync(
          matomoTrackingString([MATOMO_TRACKING_SCREEN, MATOMO_TRACKING_CATEGORY])
        );
    }
  }, [isConnected, query]);

  const isCalendar = query === QUERY_TYPES.EVENT_RECORDS;
  const isCalendarWithVolunteerEvents = isCalendar && showVolunteerEvents;

  const {
    data: dataVolunteerEvents,
    isLoading: isLoadingVolunteerEvents = false,
    refetch: refetchVolunteerEvents
  } = useVolunteerData({
    query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
    queryOptions: { enabled: isCalendarWithVolunteerEvents },
    isCalendar: isCalendarWithVolunteerEvents,
    isSectioned: true
  });

  const refresh = useCallback(
    async (refetch) => {
      setRefreshing(true);
      isConnected && (await refetch());
      isCalendarWithVolunteerEvents && refetchVolunteerEvents();
      setRefreshing(false);
    },
    [isConnected, setRefreshing]
  );

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (
          query === QUERY_TYPES.EVENT_RECORDS &&
          (!initialEventRecordsItemsFetch || !showCalendar)
        ) {
          await refetch();
        }
      };

      fetchData();
    }, [refetch])
  );

  if (!query) return null;

  if ((!data && loading) || loadingPosition || isLoadingVolunteerEvents) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const fetchMoreData = () =>
    fetchMore({
      query: getFetchMoreQuery(query),
      variables: {
        ...queryVariables,
        offset: data?.[query]?.length
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult[query].length) return prevResult;

        return {
          ...prevResult,
          [query]: [...prevResult[query], ...fetchMoreResult[query]]
        };
      }
    });

  const initialNewsItemsFetch =
    query === QUERY_TYPES.NEWS_ITEMS &&
    !Object.prototype.hasOwnProperty.call(queryVariables, 'dataProvider') &&
    !Object.prototype.hasOwnProperty.call(queryVariables, 'refetch');

  const initialEventRecordsItemsFetch =
    query === QUERY_TYPES.EVENT_RECORDS &&
    !Object.prototype.hasOwnProperty.call(queryVariables, 'categoryId') &&
    !Object.prototype.hasOwnProperty.call(queryVariables, 'location') &&
    !Object.prototype.hasOwnProperty.call(queryVariables, 'refetch') &&
    !Object.prototype.hasOwnProperty.call(queryVariables, 'dateRange') &&
    !Object.prototype.hasOwnProperty.call(queryVariables, 'refetchDate');

  // apply additional data if volunteer events should be presented and
  // no category selection is made, because the category has nothing to do with
  // volunteer data
  const additionalData =
    isCalendarWithVolunteerEvents &&
    !hasFilterSelection(query, false) &&
    !hasFilterSelection(query, true)
      ? dataVolunteerEvents
      : undefined;

  useLayoutEffect(() => {
    if (
      query === QUERY_TYPES.POINTS_OF_INTEREST &&
      showMap &&
      initialFilter === FILTER_TYPES.LIST
    ) {
      navigation.setOptions({
        headerLeft: () => (
          <HeaderLeft
            onPress={() => setFilterType(INITIAL_FILTER)}
            backImage={({ tintColor }) => (
              <Icon.Close color={tintColor} style={{ paddingHorizontal: normalize(14) }} />
            )}
          />
        )
      });
    } else {
      navigation.setOptions({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      });
    }
  }, [query, showMap]);

  return (
    <SafeAreaViewFlex>
      {query === QUERY_TYPES.POINTS_OF_INTEREST &&
        (switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER ||
          showFilterByOpeningTimes) && (
          <View>
            {switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER && (
              <IndexFilterWrapperAndList filter={filterType} setFilter={setFilterType} />
            )}
            {showFilterByOpeningTimes && (
              <OptionToggle
                label={texts.pointOfInterest.filterByOpeningTime}
                onToggle={() => setFilterByOpeningTimes((value) => !value)}
                value={filterByOpeningTimes}
              />
            )}
            <Divider />
          </View>
        )}
      {query === QUERY_TYPES.POINTS_OF_INTEREST && showMap ? (
        <LocationOverview
          filterByOpeningTimes={filterByOpeningTimes}
          navigation={navigation}
          route={route}
          position={position}
          queryVariables={{
            ...queryVariables,
            limit: undefined
          }}
        />
      ) : (
        <>
          {calendarToggle && isCalendar && !hasDailyFilterSelection && (
            <CalendarListToggle showCalendar={showCalendar} setShowCalendar={setShowCalendar} />
          )}
          <ListComponent
            ListHeaderComponent={
              <>
                {query === QUERY_TYPES.EVENT_RECORDS && !!eventListIntro && (
                  <>
                    {!!eventListIntro.introText && (
                      <Wrapper>
                        <RegularText small>{eventListIntro.introText}</RegularText>
                      </Wrapper>
                    )}

                    {!!eventListIntro.url && !!eventListIntro.buttonTitle && (
                      <Wrapper>
                        <Button
                          onPress={() => openLink(eventListIntro.url, openWebScreen)}
                          title={eventListIntro.buttonTitle}
                        />
                      </Wrapper>
                    )}
                    <Divider />
                  </>
                )}
                {!!showFilter && (
                  <>
                    <DropdownHeader
                      {...{
                        data:
                          (initialNewsItemsFetch || initialEventRecordsItemsFetch) && loading
                            ? {}
                            : data,
                        query,
                        queryVariables,
                        updateListData: updateListDataByDropdown
                      }}
                    />

                    {query === QUERY_TYPES.EVENT_RECORDS && !!eventRecordsAddressesData && (
                      <DropdownHeader
                        {...{
                          data:
                            (initialEventRecordsItemsFetch && loading) ||
                            eventRecordsAddressesLoading
                              ? {}
                              : eventRecordsAddressesData,
                          isLocationFilter: true,
                          query,
                          queryVariables,
                          updateListData: updateListDataByDropdown
                        }}
                      />
                    )}

                    {query === QUERY_TYPES.EVENT_RECORDS && data?.categories?.length && (
                      <View>
                        <OptionToggle
                          label={texts.eventRecord.filterByDailyEvents}
                          onToggle={updateListDataByDailySwitch}
                          value={filterByDailyEvents}
                        />
                      </View>
                    )}
                  </>
                )}
                {!!categories?.length && (
                  <CategoryList
                    navigation={navigation}
                    categoryTitles={categoryTitles}
                    data={categories}
                    horizontal={false}
                    hasSectionHeader={false}
                  />
                )}
                {query === QUERY_TYPES.CATEGORIES && !!categoryListIntroText && (
                  <Wrapper>
                    <RegularText>{categoryListIntroText}</RegularText>
                  </Wrapper>
                )}
                {!!htmlContent && (
                  <Wrapper>
                    <HtmlView html={htmlContent} />
                  </Wrapper>
                )}
              </>
            }
            ListEmptyComponent={
              loading ? (
                <LoadingContainer>
                  <ActivityIndicator color={colors.refreshControl} />
                </LoadingContainer>
              ) : showCalendar ? (
                <Calendar
                  query={query}
                  queryVariables={queryVariables}
                  calendarData={buildListItems(data, additionalData)}
                  isLoading={loading}
                  navigation={navigation}
                />
              ) : (
                <EmptyMessage
                  title={categories?.length ? texts.empty.categoryList : texts.empty.list}
                  showIcon={!categories?.length}
                />
              )
            }
            ListFooterComponent={
              <>
                {query === QUERY_TYPES.CATEGORIES && !!categoryListFooter && (
                  <>
                    {!!categoryListFooter.footerText && (
                      <Wrapper>
                        <RegularText small>{categoryListFooter.footerText}</RegularText>
                      </Wrapper>
                    )}
                    {!!categoryListFooter.url && !!categoryListFooter.buttonTitle && (
                      <Wrapper>
                        <Button
                          onPress={() => openLink(categoryListFooter.url, openWebScreen)}
                          title={categoryListFooter.buttonTitle}
                        />
                      </Wrapper>
                    )}
                  </>
                )}
              </>
            }
            navigation={navigation}
            data={
              loading || (isCalendar && showCalendar) ? [] : buildListItems(data, additionalData)
            }
            horizontal={false}
            sectionByDate={isCalendar ? !showCalendar : true}
            query={query}
            queryVariables={queryVariables}
            fetchMoreData={isConnected ? fetchMoreData : null}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => refresh(refetch)}
                colors={[colors.accent]}
                tintColor={colors.accent}
              />
            }
            showBackToTop
          />
        </>
      )}
      {query === QUERY_TYPES.POINTS_OF_INTEREST &&
        switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.BOTTOM_FLOATING_BUTTON &&
        filterType.find((entry) => entry.title == texts.locationOverview.list)?.selected && (
          <IndexMapSwitch filter={filterType} setFilter={setFilterType} />
        )}
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

IndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
