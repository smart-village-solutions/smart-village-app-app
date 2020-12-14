import PropTypes from 'prop-types';
import React from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon, ListComponent, LoadingContainer, SafeAreaViewFlex } from '../components';
import { colors, consts, normalize } from '../config';
import { parseListItemsFromQuery } from '../helpers';
import { useMatomoTrackScreenView } from '../hooks';
import { useBookmarks } from '../hooks/Bookmarks';
import { arrowLeft } from '../icons';
import { getQuery } from '../queries';

const { MATOMO_TRACKING } = consts;

export const BookmarkCategoryScreen = ({ navigation }) => {
  const query = navigation.getParam('query');
  const categoryId = navigation.getParam('categoryId');
  const bookmarks = useBookmarks(query, categoryId);

  const variables = { ids: bookmarks };

  // skipping if no bookmark ids results in no additional "unfiltered" queries
  // while bookmarks are loading
  const { loading, data } = useQuery(getQuery(query), { variables , skip: !bookmarks?.length });

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
