import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, device, normalize, texts } from '../config';
import {
  BookmarkSection,
  Icon,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../components';
import { getKeyFromTypeAndCategory } from '../helpers';
import { useBookmarks, useMatomoTrackScreenView } from '../hooks';
import { arrowLeft } from '../icons';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

const { MATOMO_TRACKING } = consts;

const getInitialConnectionState = (categoriesNews) => {
  let initialState = {};
  categoriesNews.forEach(({ categoryId }) => {
    initialState[getKeyFromTypeAndCategory(QUERY_TYPES.NEWS_ITEMS, categoryId)] = true;
  });
  initialState[QUERY_TYPES.EVENT_RECORDS] = true;
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
    (itemType, categoryTitle, categoryId, categoryTitleDetail) => {
      const bookmarkKey = getKeyFromTypeAndCategory(itemType, categoryId);

      if (!bookmarks[bookmarkKey]?.length) return null;

      return (
        <BookmarkSection
          bookmarkKey={bookmarkKey}
          categoryId={categoryId}
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
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center'
  },
  icon: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(4)
  },
  iconLeft: {
    paddingLeft: normalize(14),
    paddingRight: normalize(7),
    paddingVertical: normalize(4)
  },
  iconRight: {
    paddingLeft: normalize(7),
    paddingRight: normalize(14),
    paddingVertical: normalize(4)
  }
});

BookmarkScreen.navigationOptions = ({ navigation, navigationOptions }) => {
  const { headerRight } = navigationOptions;

  return {
    headerLeft: (
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Zurück (Taste)"
          accessibilityHint="Navigieren zurück zur vorherigen Seite"
        >
          <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    ),
    headerRight: (
      <WrapperRow style={styles.headerRight}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Einstellungen (Taste)"
          accessibilityHint="Zu den Einstellungen wechseln"
        >
          <Icon
            name={device.platform === 'ios' ? 'ios-settings' : 'md-settings'}
            size={normalize(26)}
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
