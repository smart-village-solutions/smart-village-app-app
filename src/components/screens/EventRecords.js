import _sortBy from 'lodash/sortBy';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, DeviceEventEmitter, RefreshControl } from 'react-native';
import { Divider } from 'react-native-elements';
import { useInfiniteQuery } from 'react-query';

import {
  Calendar,
  CalendarListToggle,
  DropdownHeader,
  EmptyMessage,
  EventSuggestionButton,
  ListComponent,
  LoadingContainer,
  OptionToggle,
  REFRESH_CALENDAR,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { openLink, parseListItemsFromQuery } from '../../helpers';
import { useOpenWebScreen, useVolunteerData } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { QUERY_TYPES, getQuery } from '../../queries';
import { ReactQueryClient } from '../../ReactQueryClient';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName } from '../../types';

export const EVENT_SUGGESTION_BUTTON = {
  TOP: 'top',
  BOTTOM_FLOATING: 'bottom-floating'
};

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

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const EventRecords = ({ navigation, route }) => {
  const { isConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { deprecated = {}, filter = {}, hdvt = {}, settings = {}, sections = {} } = globalSettings;
  const { events: showEventsFilter = true, eventLocations: showEventLocationsFilter = false } =
    filter;
  const { events: showVolunteerEvents = false } = hdvt;
  const { calendarToggle = false } = settings;
  const { eventListIntro } = sections;
  const query = route.params?.query ?? '';
  const initialQueryVariables = route.params?.queryVariables || {};
  const [queryVariables, setQueryVariables] = useState({
    ...initialQueryVariables
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
      [QUERY_TYPES.EVENT_RECORDS, queryVariables],
      async ({ pageParam = 0 }) => {
        const client = await ReactQueryClient();

        return await client.request(getQuery(QUERY_TYPES.EVENT_RECORDS), {
          ...queryVariables,
          offset: pageParam
        });
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

  const updateListDataByDropdown = useCallback(
    (selectedValue, isLocationFilter) => {
      if (selectedValue) {
        setQueryVariables((prevQueryVariables) => {
          // remove a refetch key if present, which was necessary for the "- Alle -" selection
          delete prevQueryVariables.refetch;

          return {
            ...prevQueryVariables,
            ...getAdditionalQueryVariables(selectedValue, isLocationFilter)
          };
        });
      } else {
        if (hasFilterSelection(isLocationFilter, queryVariables)) {
          setQueryVariables((prevQueryVariables) => {
            // remove the filter key for the specific query if present, when selecting "- Alle -"
            delete prevQueryVariables[keyForSelectedValueByQuery(isLocationFilter)];

            return { ...prevQueryVariables, refetch: true };
          });
        }
      }
    },
    [query, queryVariables]
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
          return { ...prevQueryVariables, dateRange: [today, today] };
        });
      } else {
        setQueryVariables((prevQueryVariables) => {
          return { ...prevQueryVariables, refetchDate: true };
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

  const fetchMoreData = useCallback(async () => {
    if (showCalendar) return { data: { [query]: [] } };

    if (hasNextPage) {
      return await fetchNextPage();
    }

    return {};
  }, [data, fetchNextPage, showCalendar, hasNextPage, query]);

  const eventSuggestionOnPress = useCallback(() => {
    if (eventListIntro.url) {
      openLink(eventListIntro.url, openWebScreen);
    } else {
      navigation.navigate(ScreenName.EventSuggestion, {
        formIntroText: eventListIntro.formIntroText
      });
    }
  }, [eventListIntro?.url, eventListIntro?.formIntroText, navigation, openWebScreen]);

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

                {!!eventListIntro.url &&
                  !!eventListIntro.buttonTitle &&
                  eventListIntro.buttonType === EVENT_SUGGESTION_BUTTON.TOP && (
                    <Wrapper>
                      <EventSuggestionButton
                        buttonTitle={eventListIntro.buttonTitle}
                        onPress={eventSuggestionOnPress}
                      />
                    </Wrapper>
                  )}
                <Divider />
              </>
            )}
            {!!showFilter && (
              <>
                {!!eventRecordsCategoriesData && (
                  <DropdownHeader
                    {...{
                      data: eventRecordsCategoriesData,
                      query,
                      queryVariables,
                      updateListData: updateListDataByDropdown
                    }}
                  />
                )}

                {!!eventRecordsAddressesData && (
                  <DropdownHeader
                    {...{
                      data: eventRecordsAddressesData,
                      isLocationFilter: true,
                      query,
                      queryVariables,
                      updateListData: updateListDataByDropdown
                    }}
                  />
                )}

                {showFilterByDailyEvents && (
                  <OptionToggle
                    label={texts.eventRecord.filterByDailyEvents}
                    onToggle={updateListDataByDailySwitch}
                    value={filterByDailyEvents}
                  />
                )}
              </>
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
      {eventListIntro?.buttonType == EVENT_SUGGESTION_BUTTON.BOTTOM_FLOATING && (
        <EventSuggestionButton
          buttonTitle={eventListIntro.buttonTitle}
          onPress={eventSuggestionOnPress}
        />
      )}
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

EventRecords.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
