import PropTypes from 'prop-types';
import _sortBy from 'lodash/sortBy';
import React, { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useQuery as RQuseQuery } from 'react-query';

import {
  ListComponent,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../components';
import { consts, texts } from '../config';
import { requestBookmarkData } from '../BookmarkQueryClient';
import { getKeyFromTypeAndSuffix, parseListItemsFromQuery } from '../helpers';
import { useBookmarks, useMatomoTrackScreenView } from '../hooks';
import { useTheme } from '../hooks/useTheme';
import { QUERY_TYPES } from '../queries';

const { MATOMO_TRACKING } = consts;
const EMPTY_BOOKMARKS = [];

const removeLastDivider = (data) =>
  data.map((item, index) => ({ ...item, bottomDivider: index !== data.length - 1 }));

/* eslint-disable complexity */
export const BookmarkCategoryScreen = ({ navigation, route }) => {
  const { colors } = useTheme();

  const query = route.params?.query ?? '';
  const additionalQuery = route.params?.additionalQuery ?? '';
  const isCombinedEventCategory =
    query === QUERY_TYPES.EVENT_RECORDS && additionalQuery === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL;
  const queryKey = query === QUERY_TYPES.VOUCHERS ? QUERY_TYPES.GENERIC_ITEMS : query;
  const queryVariables = route.params?.queryVariables ?? {};
  const suffix = route.params?.suffix ?? '';
  const categoryTitleDetail = route.params?.categoryTitleDetail ?? '';
  const bookmarkStore = useBookmarks();
  const bookmarks = bookmarkStore?.[getKeyFromTypeAndSuffix(query, suffix)] ?? EMPTY_BOOKMARKS;
  const additionalBookmarks = additionalQuery
    ? bookmarkStore?.[getKeyFromTypeAndSuffix(additionalQuery)] ?? EMPTY_BOOKMARKS
    : EMPTY_BOOKMARKS;
  const variables = useMemo(
    () => ({ ...(route.params?.queryVariables ?? {}), ids: bookmarks }),
    [bookmarks, route.params?.queryVariables]
  );
  const additionalVariables = useMemo(
    () => ({ ...(route.params?.additionalQueryVariables ?? {}), ids: additionalBookmarks }),
    [additionalBookmarks, route.params?.additionalQueryVariables]
  );

  // skipping if no bookmark ids results in no additional "unfiltered" queries
  // while bookmarks are loading
  const {
    data,
    isError,
    isLoading: loading
  } = RQuseQuery([query, variables], () => requestBookmarkData(query, variables), {
    enabled: !!bookmarks?.length
  });
  const {
    data: additionalData,
    isError: isAdditionalError,
    isLoading: isAdditionalLoading
  } = RQuseQuery(
    [additionalQuery, additionalVariables],
    () => requestBookmarkData(additionalQuery, additionalVariables),
    { enabled: !!additionalQuery && !!additionalBookmarks?.length }
  );

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.BOOKMARK_CATEGORY);

  if (!bookmarkStore || loading || isAdditionalLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  // this should only ever be reached when one navigates to the category overview screen
  // and removes all the bookmarks from that category by navigating to each detail screen
  // and toggling the bookmark status through the header
  if (bookmarks.length === 0 && !additionalBookmarks?.length) {
    return (
      <Wrapper>
        <RegularText>{texts.bookmarks.noBookmarksinCategory}</RegularText>
      </Wrapper>
    );
  }

  if (isError || isAdditionalError) {
    return (
      <Wrapper>
        <RegularText>{texts.errors.unexpected}</RegularText>
      </Wrapper>
    );
  }

  const listItems = data
    ? parseListItemsFromQuery(
        query,
        query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL ? data.results : data,
        categoryTitleDetail,
        {
          withDate:
            (query === QUERY_TYPES.EVENT_RECORDS &&
              (isCombinedEventCategory || !queryVariables?.onlyUniqEvents)) ||
            query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
          withTime:
            query === QUERY_TYPES.EVENT_RECORDS &&
            (isCombinedEventCategory || !queryVariables?.onlyUniqEvents),
          isSectioned: query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
          skipLastDivider: false,
          queryKey
        }
      )
    : [];
  const additionalListItems = additionalData
    ? parseListItemsFromQuery(
        additionalQuery,
        additionalQuery === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL
          ? additionalData.results
          : additionalData,
        categoryTitleDetail,
        {
          withDate: true,
          isSectioned: additionalQuery === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
          skipLastDivider: false
        }
      )
    : [];
  const mergedListItems = removeLastDivider(
    _sortBy(
      [...(listItems || []), ...(additionalListItems || [])],
      (item) => item.listDate,
      (item) => item.startTime || ''
    )
  );

  if (!mergedListItems.length) {
    return (
      <Wrapper>
        <RegularText>{texts.bookmarks.noBookmarksinCategory}</RegularText>
      </Wrapper>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ListComponent
        navigation={navigation}
        data={mergedListItems}
        horizontal={false}
        query={query}
      />
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

BookmarkCategoryScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
