import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator } from 'react-native';

import {
  HeaderLeft,
  ListComponent,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { colors, consts, texts } from '../config';
import { graphqlFetchPolicy, parseListItemsFromQuery } from '../helpers';
import { useMatomoTrackScreenView, useRefreshTime } from '../hooks';
import { useBookmarks } from '../hooks/Bookmarks';
import { NetworkContext } from '../NetworkProvider';
import { getQuery } from '../queries';

const { MATOMO_TRACKING } = consts;

export const BookmarkCategoryScreen = ({ navigation }) => {
  const query = navigation.getParam('query');
  const suffix = navigation.getParam('suffix');
  const categoryTitleDetail = navigation.getParam('categoryTitleDetail');
  const bookmarks = useBookmarks(query, suffix);

  const variables = { ids: bookmarks };

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
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  // this should only ever be reached when one navigates to the category overview screen
  // and removes all the bookmarks from that category by navigating to each detail screen
  // and toggling the bookmark status through the header
  if (bookmarks.length === 0) {
    return (
      <WrapperWithOrientation>
        <Wrapper>
          <RegularText>{texts.bookmarks.noBookmarksinCategory}</RegularText>
        </Wrapper>
      </WrapperWithOrientation>
    );
  }

  if (!data) {
    return (
      <WrapperWithOrientation>
        <Wrapper>
          <RegularText>{texts.errors.noData}</RegularText>
        </Wrapper>
      </WrapperWithOrientation>
    );
  }
  const listItems = parseListItemsFromQuery(query, data, false, categoryTitleDetail);

  return (
    <SafeAreaViewFlex>
      <ListComponent navigation={navigation} data={listItems} query={query} />
    </SafeAreaViewFlex>
  );
};

BookmarkCategoryScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};

BookmarkCategoryScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
