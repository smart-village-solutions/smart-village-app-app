import * as Location from 'expo-location';
import _sortBy from 'lodash/sortBy';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, DeviceEventEmitter, RefreshControl } from 'react-native';
import { Divider } from 'react-native-elements';
import { useInfiniteQuery } from 'react-query';

import {
  Calendar,
  CalendarListToggle,
  EmptyMessage,
  EventSuggestionButton,
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
import {
  filterTypesHelper,
  geoLocationFilteredListItem,
  openLink,
  parseListItemsFromQuery
} from '../../helpers';
import { updateResourceFiltersStateHelper } from '../../helpers/updateResourceFiltersStateHelper';
import {
  useLastKnownPosition,
  useLocationSettings,
  useOpenWebScreen,
  usePosition,
  useSystemPermission,
  useVolunteerData
} from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { PermanentFilterContext } from '../../PermanentFilterProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
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
  const { resourceFilters } = useContext(ConfigurationsContext);
  const { resourceFiltersState, resourceFiltersDispatch } = useContext(PermanentFilterContext);
  const { deprecated = {}, filter = {}, hdvt = {}, settings = {}, sections = {} } = globalSettings;
  const { eventLocations: showEventLocationsFilter = false } = filter;
  const { events: showVolunteerEvents = false } = hdvt;
  const { calendarToggle = false } = settings;
  const { eventListIntro } = sections;
  const query = route.params?.query ?? '';
  const initialQueryVariables = {
    ...(route.params?.queryVariables || {})
  };
  const [queryVariables, setQueryVariables] = useState({
    ...initialQueryVariables,
    ...resourceFiltersState[query]
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const title = route.params?.title ?? '';
  const hasDailyFilterSelection =
    !!queryVariables.dateRange && queryVariables.dateRange[0] === queryVariables.dateRange[1];
  const openWebScreen = useOpenWebScreen(title, eventListIntro?.url);
  const { locationSettings } = useLocationSettings();
  const systemPermission = useSystemPermission();
  const { locationService: locationServiceEnabled } = locationSettings;
  const { position: lastKnownPosition } = useLastKnownPosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED || !locationServiceEnabled
  );
  const { position } = usePosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED || !locationServiceEnabled
  );
  const currentPosition = position || lastKnownPosition;
  const [isLocationAlertShow, setIsLocationAlertShow] = useState(false);

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
    getQuery(QUERY_TYPES.EVENT_RECORDS_AND_CATEGORIES)
  );

  const { data: dataVolunteerEvents, refetch: refetchVolunteerEvents } = useVolunteerData({
    query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
    queryVariables: route.params?.queryVariables,
    queryOptions: { enabled: showVolunteerEvents && !isLoading },
    isCalendar: true,
    isSectioned: true
  });

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

    if (queryVariables?.radiusSearch?.distance) {
      parsedListItems = geoLocationFilteredListItem({
        currentPosition,
        isLocationAlertShow,
        listItem: parsedListItems,
        locationSettings,
        navigation,
        queryVariables,
        setIsLocationAlertShow
      });
    }

    return parsedListItems;
  }, [
    additionalData,
    data?.pages?.flatMap((page) => page?.[query]),
    hasDailyFilterSelection,
    query,
    queryVariables.dateRange,
    isLocationAlertShow
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
      resourceFiltersState
    });
  }, [query, queryVariables]);

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
