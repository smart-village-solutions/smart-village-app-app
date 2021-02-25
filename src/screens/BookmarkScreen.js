import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import {
  BookmarkSection,
  HeaderLeft,
  Icon,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../components';
import { colors, consts, device, normalize, texts } from '../config';
import { getKeyFromTypeAndSuffix } from '../helpers';
import { useBookmarks, useMatomoTrackScreenView } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';
import { GenericType } from '../types';

const { MATOMO_TRACKING } = consts;

const getInitialConnectionState = (categoriesNews) => {
  let initialState = {};
  categoriesNews.forEach(({ categoryId }) => {
    initialState[getKeyFromTypeAndSuffix(QUERY_TYPES.NEWS_ITEMS, categoryId)] = true;
  });
  initialState[getKeyFromTypeAndSuffix(QUERY_TYPES.GENERIC_ITEMS, GenericType.Commercial)] = true;
  initialState[getKeyFromTypeAndSuffix(QUERY_TYPES.GENERIC_ITEMS, GenericType.Job)] = true;
  initialState[QUERY_TYPES.POINTS_OF_INTEREST] = true;
  initialState[QUERY_TYPES.TOURS] = true;

  return initialState;
};

const getBookmarkCount = (bookmarks) => {
  if (!bookmarks) return 0;

  let count = 0;

  for (let key in bookmarks) {
    count += bookmarks[key]?.length ?? 0;
  }
  return count;
};

export const BookmarkScreen = ({ navigation }) => {
  const bookmarks = useBookmarks();
  const { globalSettings } = useContext(SettingsContext);
  const { sections = {} } = globalSettings;
  const { categoriesNews } = sections;
  const [connectionState, setConnectionState] = useState(getInitialConnectionState(categoriesNews));

  const getSection = useCallback(
    (itemType, categoryTitle, suffix, categoryTitleDetail) => {
      const bookmarkKey = getKeyFromTypeAndSuffix(itemType, suffix);

      if (!bookmarks[bookmarkKey]?.length) return null;

      return (
        <BookmarkSection
          bookmarkKey={bookmarkKey}
          suffix={suffix}
          categoryTitleDetail={categoryTitleDetail}
          ids={bookmarks[bookmarkKey]}
          key={bookmarkKey}
          navigation={navigation}
          query={itemType}
          sectionTitle={categoryTitle}
          setConnectionState={setConnectionState}
        />
      );
      // if there are more than three of that category, show "show all" button
    },
    [navigation, bookmarks, setConnectionState]
  );

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.BOOKMARKS);

  if (!bookmarks || getBookmarkCount(bookmarks) === 0) {
    return (
      <WrapperWithOrientation>
        <Wrapper>
          <RegularText>{texts.bookmarks.noBookmarksYet}</RegularText>
        </Wrapper>
      </WrapperWithOrientation>
    );
  }

  const connection = Object.keys(connectionState).reduce(
    (previousValue, currentValue) =>
      previousValue && (connectionState[currentValue] || !bookmarks[currentValue]?.length),
    true
  );

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        {!connection && (
          <Wrapper>
            <RegularText>{texts.errors.noData}</RegularText>
          </Wrapper>
        )}
        {categoriesNews?.map(({ categoryId, categoryTitle, categoryTitleDetail }) =>
          getSection(QUERY_TYPES.NEWS_ITEMS, categoryTitle, categoryId, categoryTitleDetail)
        )}
        {getSection(QUERY_TYPES.POINTS_OF_INTEREST, texts.categoryTitles.pointsOfInterest)}
        {getSection(QUERY_TYPES.TOURS, texts.categoryTitles.tours)}
        {getSection(QUERY_TYPES.EVENT_RECORDS, texts.homeTitles.events)}
        {getSection(
          QUERY_TYPES.GENERIC_ITEMS,
          texts.commercial.commercials,
          GenericType.Commercial
        )}
        {getSection(QUERY_TYPES.GENERIC_ITEMS, texts.job.jobs, GenericType.Job)}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center'
  },
  iconLeft: {
    paddingLeft: normalize(14),
    paddingRight: normalize(7)
  },
  iconRight: {
    paddingLeft: normalize(7),
    paddingRight: normalize(14)
  }
});

BookmarkScreen.navigationOptions = ({ navigation, navigationOptions }) => {
  const { headerRight } = navigationOptions;

  return {
    headerLeft: <HeaderLeft navigation={navigation} />,
    headerRight: (
      <WrapperRow style={styles.headerRight}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Einstellungen (Taste)"
          accessibilityHint="Zu den Einstellungen wechseln"
        >
          <Icon
            name={device.platform === 'ios' ? 'ios-settings' : 'md-settings'}
            iconColor={colors.lightestText}
            style={headerRight ? styles.iconLeft : styles.iconRight}
          />
        </TouchableOpacity>
        {!!headerRight && headerRight}
      </WrapperRow>
    )
  };
};

BookmarkScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
