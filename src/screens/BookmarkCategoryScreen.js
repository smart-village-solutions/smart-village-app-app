import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator } from 'react-native';

import {
  ListComponent,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  Wrapper
} from '../components';
import { colors, consts, texts } from '../config';
import { graphqlFetchPolicy, parseListItemsFromQuery } from '../helpers';
import { useBookmarks, useMatomoTrackScreenView, useRefreshTime } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
export const BookmarkCategoryScreen = ({ navigation, route }) => {
  const query = route.params?.query ?? '';
  const queryKey = query === QUERY_TYPES.VOUCHERS ? QUERY_TYPES.GENERIC_ITEMS : query;
  const queryVariables = route.params?.queryVariables ?? {};
  const suffix = route.params?.suffix ?? '';
  const categoryTitleDetail = route.params?.categoryTitleDetail ?? '';
  const bookmarks = useBookmarks(query, suffix);

  const variables = { ...queryVariables, ids: bookmarks };

  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const refreshTime = useRefreshTime('bookmarks', consts.REFRESH_INTERVALS.BOOKMARKS);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  // skipping if no bookmark ids results in no additional "unfiltered" queries
  // while bookmarks are loading
  const { loading, data } = useQuery(getQuery(query), {
    fetchPolicy,
    variables,
    skip: !bookmarks?.length
  });

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
    withDate: query === QUERY_TYPES.EVENT_RECORDS && !queryVariables?.onlyUniqEvents,
    withTime: query === QUERY_TYPES.EVENT_RECORDS && !queryVariables?.onlyUniqEvents,
    skipLastDivider: true,
    queryKey
  });

  return (
    <SafeAreaViewFlex>
      <ListComponent navigation={navigation} data={listItems} horizontal={false} query={query} />
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

BookmarkCategoryScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
