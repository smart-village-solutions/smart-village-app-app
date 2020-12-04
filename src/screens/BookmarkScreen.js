import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { colors, consts, device, normalize, texts } from '../config';
import {
  Button,
  Icon,
  LoadingContainer,
  SafeAreaViewFlex,
  Title,
  WrapperRow
} from '../components';
import { useBookmarks, useMatomoTrackScreenView } from '../hooks';
import { arrowLeft } from '../icons';
import { QUERY_TYPES } from '../queries';

const { MATOMO_TRACKING } = consts;

const getTitle = (category) => {
  switch (category) {
  case QUERY_TYPES.NEWS_ITEM:
    return texts.homeCategoriesNews.categoryTitle;
  case QUERY_TYPES.POINT_OF_INTEREST:
    return texts.categoryTitles.pointsOfInterest;
  case QUERY_TYPES.TOUR:
    return texts.categoryTitles.tours;
  case QUERY_TYPES.EVENT_RECORD:
    return texts.homeTitles.events;
  default:
    return category;
  }
};

const ListHeaderComponent = ({ category }) => <Title>{getTitle(category)}</Title>;

export const BookmarkScreen = ({ navigation }) => {
  const bookmarks = useBookmarks();

  const getSection = useCallback((category) => {
    // useQuery for the first three bookmarks

    if (!bookmarks[category]?.length) return null;

    // TODO: FetchMoreData
    return (
      <View>
        {<ListHeaderComponent category={category} />}
        <Text>{JSON.stringify(bookmarks[category])}</Text>
        {/* <ListComponent
          navigation={navigation}
          data={bookmarks[category]}
          query={category}
          ListHeaderComponent={ListHeaderComponent}
        /> */}
        {bookmarks[category].length > 3 ?
          (<Button title={texts.bookmarks.showAll}
            onPress={() => navigation.navigate('BookmarkCategory', { category })}
          />) : null
        }
      </View>
    );
    // if there are more than three of that category, show "show all" button

  }, [navigation, bookmarks]);

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.BOOKMARKS);

  if (!bookmarks) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  return (
    <SafeAreaViewFlex>
      {getSection(QUERY_TYPES.NEWS_ITEM)}
      {getSection(QUERY_TYPES.POINT_OF_INTEREST)}
      {getSection(QUERY_TYPES.TOUR)}
      {getSection(QUERY_TYPES.EVENT_RECORD)}
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

ListHeaderComponent.propTypes = {
  category: PropTypes.string
};
