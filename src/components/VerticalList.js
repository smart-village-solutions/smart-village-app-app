import PropTypes from 'prop-types';
import React, { useContext, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { colors, normalize } from '../config';
import { useRenderItem } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

import { BackToTop } from './BackToTop';
import { SWITCH_BETWEEN_LIST_AND_MAP } from './screens';

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

const MAX_INITIAL_NUM_TO_RENDER = 15;

export const VerticalList = ({
  data,
  refetch,
  fetchMoreData,
  ListEmptyComponent,
  ListHeaderComponent,
  navigation,
  noSubtitle,
  noOvertitle,
  listType,
  openWebScreen,
  query,
  refreshControl,
  showBackToTop
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { switchBetweenListAndMap = SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER } = settings;
  const flatListRef = useRef();
  const [listEndReached, setListEndReached] = useState(false);

  const renderItem = useRenderItem(query, navigation, {
    noSubtitle,
    noOvertitle,
    openWebScreen,
    refetch,
    listType
  });

  const onEndReached = async () => {
    if (fetchMoreData) {
      // if there is a pagination, the end of the list is reached, when no more data is returned
      // from partially fetching, so we need to check the data to determine the lists end
      const { data: moreData } = await fetchMoreData();

      setListEndReached(!moreData[query].length);
    } else {
      setListEndReached(true);
    }
  };

  return (
    <FlatList
      ref={flatListRef}
      keyExtractor={keyExtractor}
      data={data}
      renderItem={renderItem}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={() => {
        if (data?.length >= MAX_INITIAL_NUM_TO_RENDER) {
          if (!listEndReached) {
            return (
              <ActivityIndicator color={colors.refreshControl} style={{ margin: normalize(14) }} />
            );
          } else if (listEndReached && showBackToTop) {
            return (
              <>
                <BackToTop
                  onPress={() =>
                    flatListRef.current.scrollToIndex({
                      index: 0,
                      viewPosition: 1,
                      animated: true
                    })
                  }
                />
                {query == QUERY_TYPES.POINTS_OF_INTEREST &&
                  switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.BOTTOM_FLOATING_BUTTON && (
                    <View style={styles.spacer} />
                  )}
              </>
            );
          }
        } else if (
          query == QUERY_TYPES.POINTS_OF_INTEREST &&
          switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.BOTTOM_FLOATING_BUTTON
        ) {
          return <View style={styles.spacer} />;
        }

        return null;
      }}
      initialNumToRender={
        data?.length < MAX_INITIAL_NUM_TO_RENDER ? data.length : MAX_INITIAL_NUM_TO_RENDER
      }
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainerStyle}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(16)
  },
  contentContainerStyle: {
    flexGrow: 1
  },
  spacer: {
    height: normalize(70)
  }
});

VerticalList.propTypes = {
  data: PropTypes.array,
  refetch: PropTypes.func,
  fetchMoreData: PropTypes.func,
  leftImage: PropTypes.bool,
  ListEmptyComponent: PropTypes.object,
  ListHeaderComponent: PropTypes.object,
  navigation: PropTypes.object,
  noSubtitle: PropTypes.bool,
  noOvertitle: PropTypes.bool,
  listType: PropTypes.string,
  openWebScreen: PropTypes.func,
  query: PropTypes.string,
  refreshControl: PropTypes.object,
  showBackToTop: PropTypes.bool
};

VerticalList.defaultProps = {
  noSubtitle: false,
  noOvertitle: false,
  leftImage: false
};
