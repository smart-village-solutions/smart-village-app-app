import PropTypes from 'prop-types';
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
import { colors, consts, texts } from '../config';
import { parseListItemsFromQuery } from '../helpers';
import { useBookmarks, useMatomoTrackScreenView } from '../hooks';
import { getQuery, QUERY_TYPES } from '../queries';
import { ReactQueryClient } from '../ReactQueryClient';

const { LIST_TYPES, MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
export const BookmarkCategoryScreen = ({ navigation, route }) => {
  const query = route.params?.query ?? '';
  const queryKey = query === QUERY_TYPES.VOUCHERS ? QUERY_TYPES.GENERIC_ITEMS : query;
  const suffix = route.params?.suffix ?? '';
  const categoryTitleDetail = route.params?.categoryTitleDetail ?? '';
  const bookmarks = useBookmarks(query, suffix);
  const listType = route.params?.listType ?? LIST_TYPES.TEXT_LIST;

  const variables = useMemo(
    () => ({ ...(route.params?.queryVariables ?? {}), ids: bookmarks }),
    [bookmarks, route.params?.queryVariables]
  );

  // skipping if no bookmark ids results in no additional "unfiltered" queries
  // while bookmarks are loading
  const { data, isLoading: loading } = RQuseQuery(
    [query, variables],
    async () => {
      const client = await ReactQueryClient();

      return await client.request(getQuery(query), variables);
    },
    { enabled: !!bookmarks?.length }
  );

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.BOOKMARK_CATEGORY);

  if (loading || !bookmarks) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  // this should only ever be reached when one navigates to the category overview screen
  // and removes all the bookmarks from that category by navigating to each detail screen
  // and toggling the bookmark status through the header
  if (bookmarks.length === 0) {
    return (
      <Wrapper>
        <RegularText>{texts.bookmarks.noBookmarksinCategory}</RegularText>
      </Wrapper>
    );
  }

  if (!data) {
    return (
      <Wrapper>
        <RegularText>{texts.errors.noData}</RegularText>
      </Wrapper>
    );
  }
  const listItems = parseListItemsFromQuery(query, data, categoryTitleDetail, {
    withDate: query === QUERY_TYPES.EVENT_RECORDS,
    withTime: query === QUERY_TYPES.EVENT_RECORDS,
    skipLastDivider: true,
    queryKey
  });

  if (!listItems?.length) {
    return (
      <Wrapper>
        <RegularText>{texts.errors.noData}</RegularText>
      </Wrapper>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ListComponent
        navigation={navigation}
        data={listItems}
        horizontal={false}
        query={query}
        listType={listType}
      />
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

BookmarkCategoryScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
