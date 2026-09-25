import { useFocusEffect } from 'expo-router/react-navigation';
import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { useProfileContext } from '../ProfileProvider';
import { SettingsContext } from '../SettingsProvider';
import { BookmarkSection, RegularText, SafeAreaViewFlex, Wrapper } from '../components';
import { consts, texts } from '../config';
import { getKeyFromTypeAndSuffix } from '../helpers';
import { getGenericItemSectionTitle } from '../helpers/genericTypeHelper';
import { useBookmarks, useMatomoTrackScreenView, useNewsCategories } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { GenericType } from '../types';
import { useTheme } from '../hooks/useTheme';

const { MATOMO_TRACKING } = consts;

const getBookmarkCount = (bookmarks, isLoggedIn) => {
  if (!bookmarks) return 0;

  let count = 0;

  for (let key in bookmarks) {
    // skip for noticeboard entries and user is not logged in
    if (!isLoggedIn && key === `${QUERY_TYPES.GENERIC_ITEMS}-${GenericType.Noticeboard}`) continue;

    count += bookmarks[key]?.length ?? 0;
  }

  return count;
};

export const BookmarkScreen = ({ navigation, route }) => {
  const { colors } = useTheme();

  const bookmarks = useBookmarks();
  const { isLoggedIn, refresh } = useProfileContext();
  const categoriesNews = useNewsCategories();
  const { globalSettings } = useContext(SettingsContext);
  const { sections = {} } = globalSettings;
  const { categoryTitles = {} } = sections;
  const {
    bookmarkCategoryTitlesPointsOfInterest = texts.categoryTitles.pointsOfInterest,
    bookmarkCategoryTitlesTours = texts.categoryTitles.tours
  } = categoryTitles;
  const query = route.params?.query || '';
  const eventBookmarkIds = bookmarks?.[QUERY_TYPES.EVENT_RECORDS] || [];
  const volunteerEventBookmarkIds = bookmarks?.[QUERY_TYPES.VOLUNTEER.CALENDAR_ALL] || [];

  const getSection = useCallback(
    (itemType, categoryTitle, suffix, categoryTitleDetail, parentCategoryId) => {
      const bookmarkKey = getKeyFromTypeAndSuffix(itemType, parentCategoryId || suffix);

      if (!bookmarks[bookmarkKey]?.length || (!!query && query !== bookmarkKey)) return null;

      return (
        <BookmarkSection
          suffix={parentCategoryId || suffix}
          categoryTitleDetail={categoryTitleDetail}
          ids={bookmarks[bookmarkKey]}
          key={bookmarkKey}
          navigation={navigation}
          query={itemType}
          sectionTitle={categoryTitle}
        />
      );
      // if there are more than three of that category, show "show all" button
    },
    [bookmarks, navigation, query]
  );

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.BOOKMARKS);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!bookmarks || getBookmarkCount(bookmarks, isLoggedIn) === 0) {
    return (
      <Wrapper>
        <RegularText>{texts.bookmarks.noBookmarksYet}</RegularText>
      </Wrapper>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        {categoriesNews?.map(
          ({ categoryId, categoryTitle, categoryTitleDetail, parentCategoryId }) =>
            getSection(
              QUERY_TYPES.NEWS_ITEMS,
              categoryTitle,
              categoryId,
              categoryTitleDetail,
              parentCategoryId
            )
        )}
        {getSection(QUERY_TYPES.POINTS_OF_INTEREST, bookmarkCategoryTitlesPointsOfInterest)}
        {getSection(QUERY_TYPES.TOURS, bookmarkCategoryTitlesTours)}
        {!!(eventBookmarkIds.length || volunteerEventBookmarkIds.length) &&
          (!query ||
            [QUERY_TYPES.EVENT_RECORDS, QUERY_TYPES.VOLUNTEER.CALENDAR_ALL].includes(query)) && (
            <BookmarkSection
              additionalIds={volunteerEventBookmarkIds}
              additionalQuery={QUERY_TYPES.VOLUNTEER.CALENDAR_ALL}
              ids={eventBookmarkIds}
              key={QUERY_TYPES.EVENT_RECORDS}
              navigation={navigation}
              query={QUERY_TYPES.EVENT_RECORDS}
              sectionTitle={texts.screenTitles.events}
            />
          )}
        {getSection(QUERY_TYPES.VOUCHERS, '')}
        {getSection(
          QUERY_TYPES.GENERIC_ITEMS,
          getGenericItemSectionTitle(GenericType.Commercial),
          GenericType.Commercial
        )}
        {getSection(
          QUERY_TYPES.GENERIC_ITEMS,
          getGenericItemSectionTitle(GenericType.Deadline),
          GenericType.Deadline
        )}
        {getSection(
          QUERY_TYPES.GENERIC_ITEMS,
          getGenericItemSectionTitle(GenericType.Job),
          GenericType.Job
        )}
        {/* TODO: what about bookmarks for noticeboards without profiles? that would never be
                  listed here. maybe we need some global setting to flag noticeboards usage with
                  or without profiles? */}
        {!!isLoggedIn &&
          getSection(
            QUERY_TYPES.GENERIC_ITEMS,
            getGenericItemSectionTitle(GenericType.Noticeboard),
            GenericType.Noticeboard
          )}
        {getSection(
          QUERY_TYPES.GENERIC_ITEMS,
          getGenericItemSectionTitle(GenericType.ParticipationProject),
          GenericType.ParticipationProject
        )}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

BookmarkScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object
};
