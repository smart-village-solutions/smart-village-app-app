import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

import { colors, consts, device, normalize, texts } from '../config';
import {
  BookmarkSection,
  Icon,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperRow
} from '../components';
import { getKeyFromTypeAndCategory } from '../helpers';
import { useBookmarks, useMatomoTrackScreenView } from '../hooks';
import { arrowLeft } from '../icons';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

const { MATOMO_TRACKING } = consts;

const getBookmarkCount = (bookmarks) => {
  if(!bookmarks) return 0;

  let count = 0;

  for(let key in bookmarks) {
    count += bookmarks[key]?.length ?? 0;
  }
  return count;
};

export const BookmarkScreen = ({ navigation }) => {
  const bookmarks = useBookmarks();
  const { globalSettings } = useContext(SettingsContext);
  const { sections = {} } = globalSettings;
  const { categoriesNews } = sections;

  const getSection = useCallback((itemType, categoryTitle, categoryId) => {
    const key = getKeyFromTypeAndCategory(itemType, categoryId);

    if (!bookmarks[key]?.length) return null;

    return (
      <View key={key}>
        <BookmarkSection
          categoryId={categoryId}
          ids={bookmarks[key]}
          navigation={navigation}
          query={itemType}
          sectionTitle={categoryTitle}
        />
      </View>
    );
    // if there are more than three of that category, show "show all" button

  }, [navigation, bookmarks]);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.BOOKMARKS);

  if (!bookmarks || getBookmarkCount(bookmarks) === 0) {
    return (
      <Wrapper>
        <RegularText>
          {texts.bookmarks.noBookmarksYet}
        </RegularText>
      </Wrapper>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        {categoriesNews?.map(({ categoryId, categoryTitle }) =>
          getSection(QUERY_TYPES.NEWS_ITEMS, categoryTitle, categoryId))}
        {getSection(QUERY_TYPES.POINTS_OF_INTEREST)}
        {getSection(QUERY_TYPES.TOURS)}
        {getSection(QUERY_TYPES.EVENT_RECORDS)}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
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
      <WrapperRow>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Einstellungen (Taste)"
          accessibilityHint="Zu den Einstellungen wechseln"
        >
          <Icon
            name={device.platform === 'ios' ? 'ios-settings' : 'md-settings'}
            size={26}
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
