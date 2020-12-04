import PropTypes from 'prop-types';
import React from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon, ListComponent, LoadingContainer, SafeAreaViewFlex } from '../components';
import { colors, consts, normalize } from '../config';
import { parseListItemsFromQuery } from '../helpers';
import { mapCategoryToListQueryType } from '../helpers/bookmarkHelpers';
import { useMatomoTrackScreenView } from '../hooks';
import { useBookmarks } from '../hooks/Bookmarks';
import { arrowLeft } from '../icons';
import { getQuery } from '../queries';

const { MATOMO_TRACKING } = consts;

export const BookmarkCategoryScreen = ({ navigation }) => {
  const category = navigation.getParam('category');
  const bookmarks = useBookmarks(category);

  const query = mapCategoryToListQueryType(category);
  // dummy data
  const { loading, data } = useQuery(getQuery(query), {
    variables: { limit: 3 }
  });

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.BOOKMARK_CATEGORY);

  if (loading || !bookmarks) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const listItems = parseListItemsFromQuery(query, data);

  return (
    <SafeAreaViewFlex>
      <ListComponent
        navigation={navigation}
        data={listItems}
        query={query}
      />
      {/* <ListComponent
        navigation={navigation}
        data={data}
        query={category}
        horizontal={listType === LIST_TYPES.CARD_LIST}
      /> */}
    </SafeAreaViewFlex>
  );

};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});

BookmarkCategoryScreen.navigationOptions = ({ navigation }) => {
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
    )
  };
};

BookmarkCategoryScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
