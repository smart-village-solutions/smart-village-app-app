import _sortBy from 'lodash/sortBy';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, DeviceEventEmitter, RefreshControl } from 'react-native';
import { Divider } from 'react-native-elements';
import { useInfiniteQuery } from 'react-query';

import {
  Button,
  Calendar,
  CalendarListToggle,
  EmptyMessage,
  Filter,
  ListComponent,
  LoadingContainer,
  OptionToggle,
  REFRESH_CALENDAR,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { filterTypesHelper, openLink, parseListItemsFromQuery } from '../../helpers';
import { updateResourceFiltersStateHelper } from '../../helpers/updateResourceFiltersStateHelper';
import { useOpenWebScreen, useVolunteerData } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { PermanentFilterContext } from '../../PermanentFilterProvider';
import { QUERY_TYPES, getQuery } from '../../queries';
import { ReactQueryClient } from '../../ReactQueryClient';
import { SettingsContext } from '../../SettingsProvider';

const keyForSelectedValueByQuery = (isLocationFilter) =>
  isLocationFilter ? 'location' : 'categoryId';

const getAdditionalQueryVariables = (selectedValue, isLocationFilter) => {
  const keyForSelectedValue = keyForSelectedValueByQuery(isLocationFilter);
  const additionalQueryVariables = {};

  if (selectedValue) {
    additionalQueryVariables[keyForSelectedValue] = selectedValue;
  }

  return additionalQueryVariables;
};

const hasFilterSelection = (isLocationFilter, queryVariables) => {
  return !!Object.prototype.hasOwnProperty.call(queryVariables, [
    keyForSelectedValueByQuery(isLocationFilter)
  ]);
};

const today = moment().format('YYYY-MM-DD');
// we need to set a date range to correctly sort the results by list date, so we set it far in the future
const todayIn10Years = moment().add(10, 'years').format('YYYY-MM-DD');

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const EventRecords = ({ navigation, route }) => {
  const { isConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { resourceFilters } = useContext(ConfigurationsContext);
  const { resourceFiltersState, resourceFiltersDispatch } = useContext(PermanentFilterContext);
  const { deprecated = {}, filter = {}, hdvt = {}, settings = {}, sections = {} } = globalSettings;
  const { events: showEventsFilter = true, eventLocations: showEventLocationsFilter = false } =
    filter;
  const { events: showVolunteerEvents = false } = hdvt;
  const { calendarToggle = false } = settings;
  const { eventListIntro } = sections;
  const query = route.params?.query ?? '';
  const initialQueryVariables = {
    ...(route.params?.queryVariables || {}),
    dateRange: (route.params?.queryVariables || {}).dateRange || [today, todayIn10Years]
  };
  const [queryVariables, setQueryVariables] = useState({
    ...initialQueryVariables,
    ...resourceFiltersState[query]
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filterByDailyEvents, setFilterByDailyEvents] = useState(
    route.params?.filterByDailyEvents ?? false
  );
  const title = route.params?.title ?? '';
  const showFilter = (route.params?.showFilter ?? true) && showEventsFilter;
  const showFilterByDailyEvents =
    (route.params?.showFilterByDailyEvents ?? showFilter) && !showCalendar;
  const hasDailyFilterSelection =
    !!queryVariables.dateRange && queryVariables.dateRange[0] === queryVariables.dateRange[1];
  const openWebScreen = useOpenWebScreen(title, eventListIntro?.url);

  // https://github.com/ndraaditiya/React-Query-GraphQL/blob/main/src/services/index.jsx
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      [
        deprecated?.events?.listingWithoutDateFragment
          ? QUERY_TYPES.EVENT_RECORDS_WITHOUT_DATE_FRAGMENT
          : QUERY_TYPES.EVENT_RECORDS,
        {
          ...queryVariables,
          limit: undefined,
          take: queryVariables.limit
        }
      ],
      async ({ pageParam = 0 }) => {
        const client = await ReactQueryClient();

        return await client.request(
          getQuery(
            deprecated?.events?.listingWithoutDateFragment
              ? QUERY_TYPES.EVENT_RECORDS_WITHOUT_DATE_FRAGMENT
              : QUERY_TYPES.EVENT_RECORDS
          ),
          {
            ...queryVariables,
            limit: undefined,
            take: queryVariables.limit,
            offset: pageParam
          }
        );
      },
      {
        enabled: !showCalendar,
        getNextPageParam: (lastPage, allPages) => {
          if (lastPage?.[QUERY_TYPES.EVENT_RECORDS]?.length < queryVariables.limit) {
            return undefined;
          }

          return allPages.length * queryVariables.limit;
        }
      }
    );

  const { data: eventRecordsAddressesData, loading: eventRecordsAddressesLoading } = useQuery(
    getQuery(QUERY_TYPES.EVENT_RECORDS_ADDRESSES),
    {
      skip: !showEventLocationsFilter
    }
  );

  const { data: eventRecordsCategoriesData, loading: eventRecordsCategoriesLoading } = useQuery(
    getQuery(QUERY_TYPES.EVENT_RECORDS_AND_CATEGORIES),
    {
      skip: !showEventsFilter
    }
  );

  const { data: dataVolunteerEvents, refetch: refetchVolunteerEvents } = useVolunteerData({
    query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
    queryVariables: route.params?.queryVariables,
    queryOptions: { enabled: showVolunteerEvents && !isLoading },
    isCalendar: true,
    isSectioned: true
  });

  const updateListDataByDailySwitch = useCallback(() => {
    // update switch state as well
    setFilterByDailyEvents((oldSwitchValue) => {
      // if `oldSwitchValue` was false, we now activate the daily filter and set a date range
      if (!oldSwitchValue) {
        setQueryVariables((prevQueryVariables) => {
          // remove a refetch key if present, which was necessary for unselecting daily events
          delete prevQueryVariables.refetchDate;

          // add the filter key for the specific query, when filtering for daily events
          return { ...prevQueryVariables, dateRange: [today, today] };
        });
      } else {
        setQueryVariables((prevQueryVariables) => {
          return { ...prevQueryVariables, dateRange: [today, todayIn10Years], refetchDate: true };
        });
      }

      return !oldSwitchValue;
    });
  }, [filterByDailyEvents, queryVariables]);

  // apply additional data if volunteer events should be presented and no filter selection is made,
  // because filtered data for category or location has nothing to do with volunteer data
  const additionalData =
    showVolunteerEvents &&
    !hasFilterSelection(false, queryVariables) &&
    !(showEventLocationsFilter && hasFilterSelection(true, queryVariables))
      ? dataVolunteerEvents
      : undefined;

  const listItems = useMemo(() => {
    let parsedListItems =
      parseListItemsFromQuery(
        query,
        {
          [query]: data?.pages?.flatMap((page) => page?.[query])
        },
        undefined,
        {
          withDate: false,
          withTime: true
        }
      ) || [];

    if (additionalData?.length) {
      let filteredAdditionalData;

      if (hasDailyFilterSelection) {
        // filter additionalData on given or current day
        filteredAdditionalData = additionalData.filter(
          (item) => item.listDate === (queryVariables.dateRange?.[0] ?? today)
        );
      }

      parsedListItems.push(...(filteredAdditionalData ?? additionalData));
      parsedListItems = _sortBy(parsedListItems, (item) => item.listDate);
    }

    return parsedListItems;
  }, [
    additionalData,
    data?.pages?.flatMap((page) => page?.[query]),
    hasDailyFilterSelection,
    query,
    queryVariables.dateRange
  ]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      showCalendar && DeviceEventEmitter.emit(REFRESH_CALENDAR);
      await refetch();
      showVolunteerEvents && refetchVolunteerEvents();
    }
    setRefreshing(false);
  }, [
    isConnected,
    refetch,
    refetchVolunteerEvents,
    setRefreshing,
    showCalendar,
    showVolunteerEvents
  ]);

  const filterTypes = useMemo(() => {
    return filterTypesHelper({
      data,
      query,
      resourceFilters,
      categories: eventRecordsCategoriesData,
      locations: eventRecordsAddressesData,
      queryVariables
    });
  }, [data]);

  useEffect(() => {
    updateResourceFiltersStateHelper({
      query,
      queryVariables,
      resourceFiltersDispatch,
      resourceFiltersState,
      setQueryVariables
    });
  }, [query, queryVariables]);

  const fetchMoreData = useCallback(async () => {
    if (showCalendar) return { data: { [query]: [] } };

    if (hasNextPage) {
      return await fetchNextPage();
    }

    return {};
  }, [data, fetchNextPage, showCalendar, hasNextPage, query]);

  if (!query) return null;

  if (
    (!listItems && isLoading && !isRefetching && !isFetchingNextPage) ||
    eventRecordsAddressesLoading ||
    eventRecordsCategoriesLoading
  ) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  return (
    <SafeAreaViewFlex>
      <Filter
        filterTypes={filterTypes}
        initialFilters={initialQueryVariables}
        isOverlay
        queryVariables={queryVariables}
        setQueryVariables={setQueryVariables}
      />

      {calendarToggle && !hasDailyFilterSelection && (
        <CalendarListToggle showCalendar={showCalendar} setShowCalendar={setShowCalendar} />
      )}
      <ListComponent
        ListHeaderComponent={
          <>
            {!!eventListIntro && (
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

            {!!showFilter && showFilterByDailyEvents && (
              <OptionToggle
                label={texts.eventRecord.filterByDailyEvents}
                onToggle={updateListDataByDailySwitch}
                value={filterByDailyEvents}
              />
            )}
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingContainer>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          ) : showCalendar ? (
            <Calendar
              query={query}
              queryVariables={queryVariables}
              navigation={navigation}
              additionalData={additionalData}
            />
          ) : (
            <EmptyMessage title={texts.empty.list} showIcon />
          )
        }
        navigation={navigation}
        data={isLoading || showCalendar ? [] : listItems}
        horizontal={false}
        sectionByDate={!showCalendar}
        query={query}
        queryVariables={queryVariables}
        fetchMoreData={fetchMoreData}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
        showBackToTop
      />
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

EventRecords.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
