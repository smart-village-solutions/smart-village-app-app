import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useCallback, useContext, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';

import { SettingsContext } from '../../SettingsProvider';
import {
  Button,
  Calendar,
  CalendarListToggle,
  DefaultKeyboardAvoidingView,
  EmptyMessage,
  Filter,
  HtmlView,
  ListComponent,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  Search,
  VolunteerPostTextField,
  Wrapper,
  WrapperHorizontal,
  WrapperVertical
} from '../../components';
import { colors, consts, texts } from '../../config';
import {
  useCalendarsHeader,
  useConversationsHeader,
  useGroupsHeader,
  useOpenWebScreen,
  useStaticContent,
  useVolunteerData,
  VOLUNTEER_FILTER_BY,
  VOLUNTEER_SORT_BY
} from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName, VolunteerUser } from '../../types';

const { FILTER_TYPES, ROOT_ROUTE_NAMES } = consts;

const limit = 99999; // NOTE: we want to receive all groups
const page = 1;

const STATUSES = [
  {
    value: texts.volunteer.filter.statuses.member,
    selected: false,
    filterValue: VOLUNTEER_FILTER_BY.MEMBER,
    index: 1,
    id: 1
  },
  {
    value: texts.volunteer.filter.statuses.follow,
    selected: false,
    filterValue: VOLUNTEER_FILTER_BY.FOLLOW,
    index: 2,
    id: 2
  },
  {
    value: texts.volunteer.filter.statuses.none,
    selected: false,
    filterValue: VOLUNTEER_FILTER_BY.NONE,
    index: 3,
    id: 3
  },
  {
    value: texts.volunteer.filter.statuses.archived,
    selected: false,
    filterValue: VOLUNTEER_FILTER_BY.ARCHIVED,
    index: 4,
    id: 4
  }
];

const SORT_OPTIONS = [
  {
    value: texts.filter.sorting.alphabetical,
    selected: false,
    filterValue: VOLUNTEER_SORT_BY.ALPHABETICAL,
    index: 1,
    id: 1
  },
  {
    value: texts.filter.sorting.createdAtLatestFirst,
    selected: false,
    filterValue: VOLUNTEER_SORT_BY.CREATED_AT_LATEST_FIRST,
    index: 2,
    id: 2
  },
  {
    value: texts.filter.sorting.createdAtOldestFirst,
    selected: false,
    filterValue: VOLUNTEER_SORT_BY.CREATED_AT_OLDEST_FIRST,
    index: 3,
    id: 3
  }
];

/* eslint-disable complexity */
export const VolunteerIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { calendarToggle = false } = settings;
  const initialQueryVariables = route.params?.queryVariables ?? { limit, page };
  const [queryVariables] = useState(initialQueryVariables);
  const [filterVariables, setFilterVariables] = useState(initialQueryVariables);
  const [showCalendar, setShowCalendar] = useState(false);
  const query = route.params?.query ?? '';
  const queryOptions = route.params?.queryOptions;
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';
  const isGroupMember = route.params?.isGroupMember ?? false;
  const isAttendingEvent = route.params?.isAttendingEvent ?? false;
  const isCalendar =
    query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL || query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY;
  const isPosts = query === QUERY_TYPES.VOLUNTEER.POSTS;
  const isGroups =
    query === QUERY_TYPES.VOLUNTEER.GROUPS || query === QUERY_TYPES.VOLUNTEER.GROUPS_MY;
  const hasDailyFilterSelection = !!queryVariables.dateRange;

  const { data, isLoading, refetch, userGuid } = useVolunteerData({
    query,
    queryVariables,
    queryOptions,
    isCalendar,
    titleDetail,
    bookmarkable,
    onlyUpcoming: !showCalendar,
    filterVariables
  });

  const {
    data: dataGroupsIntroText,
    loading: isLoadingGroupsIntroText,
    refetch: refetchGroupsIntroText
  } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-volunteerGroupsIntroText',
    name: 'volunteerGroupsIntroText',
    type: 'html'
  });

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);

  useConversationsHeader({ query, navigation, route });
  useCalendarsHeader({ query, navigation, route });
  useGroupsHeader({ query, navigation, route });

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchGroupsIntroText();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS) {
        // this is needed because the chat screen is locked to portrait mode
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
      }
    }, [])
  );

  if (isLoading || isLoadingGroupsIntroText) {
    return <LoadingSpinner loading />;
  }

  if (!data) return null;

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        {isCalendar && calendarToggle && !hasDailyFilterSelection && (
          <CalendarListToggle showCalendar={showCalendar} setShowCalendar={setShowCalendar} />
        )}
        {isPosts && isGroupMember && (
          <WrapperHorizontal>
            <VolunteerPostTextField
              contentContainerId={queryVariables?.contentContainerId}
              refetch={refetch}
            />
          </WrapperHorizontal>
        )}
        <ListComponent
          ListHeaderComponent={
            <>
              {/* {showFilter && <DropdownHeader {...{ query: query, queryVariables, data }} />} */}
              {isGroups && (
                <>
                  <WrapperVertical>
                    <HtmlView html={dataGroupsIntroText} />
                  </WrapperVertical>
                  <WrapperVertical>
                    <Search
                      placeholder={texts.filter.search}
                      setQueryVariables={setFilterVariables}
                    />
                  </WrapperVertical>
                  <Filter
                    filterTypes={[
                      {
                        type: FILTER_TYPES.DROPDOWN,
                        label: texts.volunteer.filter.status,
                        name: 'status',
                        data: STATUSES,
                        searchable: false,
                        placeholder: texts.volunteer.filter.chooseStatus
                      },
                      {
                        type: FILTER_TYPES.DROPDOWN,
                        label: texts.volunteer.filter.sort,
                        name: 'sortBy',
                        data: SORT_OPTIONS,
                        searchable: false,
                        placeholder: texts.volunteer.filter.chooseSort
                      }
                    ]}
                    initialQueryVariables={initialQueryVariables}
                    isOverlay
                    queryVariables={filterVariables}
                    setQueryVariables={setFilterVariables}
                    withSearch
                  />

                  {!!data?.length && (
                    <RegularText small>
                      {data.length} {data.length === 1 ? texts.filter.result : texts.filter.results}
                    </RegularText>
                  )}
                </>
              )}
            </>
          }
          ListEmptyComponent={
            showCalendar ? (
              <Calendar
                additionalData={data}
                isListRefreshing={isLoading}
                navigation={navigation}
                query={query}
                queryVariables={queryVariables}
              />
            ) : (
              <EmptyMessage title={texts.empty.list} />
            )
          }
          navigation={navigation}
          data={isCalendar && showCalendar ? [] : data}
          sectionByDate={isCalendar && !showCalendar}
          query={query}
          queryVariables={{ userGuid, isPartOfIndexScreen: false }}
          refetch={refetch}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
          showBackToTop
          openWebScreen={openWebScreen}
        />

        {(((query === QUERY_TYPES.VOLUNTEER.MEMBERS ||
          query === QUERY_TYPES.VOLUNTEER.APPLICANTS) &&
          isGroupMember) ||
          (query === QUERY_TYPES.VOLUNTEER.CALENDAR && isAttendingEvent)) &&
          data?.length > 1 && (
            <Wrapper style={styles.noPaddingBottom}>
              <Button
                onPress={() =>
                  navigation.push(ScreenName.VolunteerForm, {
                    title: texts.volunteer.conversationAllStart,
                    query: QUERY_TYPES.VOLUNTEER.CONVERSATION,
                    rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
                    selectedUserIds: data.map(({ id }: VolunteerUser) => id)
                  })
                }
                title={texts.volunteer.conversationAllStart}
              />
            </Wrapper>
          )}
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  noPaddingBottom: {
    paddingBottom: 0
  }
});
