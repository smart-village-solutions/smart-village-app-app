import PropTypes from 'prop-types';
import React, { useContext, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { colors, consts, normalize } from '../config';
import { useRenderItem } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

import { BackToTop } from './BackToTop';

const { SWITCH_BETWEEN_LIST_AND_MAP } = consts;

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

const MAX_INITIAL_NUM_TO_RENDER = 15;

/* eslint-disable complexity */
export const VerticalList = ({
  containerStyle,
  data,
  fetchMoreData,
  isIndexStartingAt1 = false,
  isLoading = false,
  ListEmptyComponent,
  ListFooterComponent,
  ListFooterLoadingIndicator,
  ListHeaderComponent,
  listType,
  navigation,
  noOvertitle = false,
  noSubtitle = false,
  openWebScreen,
  query,
  queryVariables,
  refetch,
  refreshControl,
  showBackToTop,
  stickyHeaderIndices
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { switchBetweenListAndMap = SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER } = settings;
  const isPartOfIndexScreen = !!query && !!queryVariables?.isPartOfIndexScreen;
  const flatListRef = useRef();
  const [listEndReached, setListEndReached] = useState(false);

  const renderItem = useRenderItem(query, navigation, {
    isIndexStartingAt1,
    listType,
    noOvertitle,
    noSubtitle,
    openWebScreen,
    queryVariables,
    refetch
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
        if (query === QUERY_TYPES.EVENT_RECORDS && ListFooterComponent) {
          return <ListFooterComponent />;
        }

        if (data?.length >= MAX_INITIAL_NUM_TO_RENDER) {
          if (!listEndReached) {
            if (ListFooterLoadingIndicator) {
              return <ListFooterLoadingIndicator />;
            }

            return (
              <ActivityIndicator color={colors.refreshControl} style={styles.loadingIndicator} />
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
                {isPartOfIndexScreen &&
                  query == QUERY_TYPES.POINTS_OF_INTEREST &&
                  switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.BOTTOM_FLOATING_BUTTON && (
                    <View style={styles.spacer} />
                  )}
              </>
            );
          }
        } else if (isLoading) {
          if (ListFooterLoadingIndicator) {
            return <ListFooterLoadingIndicator />;
          }

          return (
            <ActivityIndicator color={colors.refreshControl} style={styles.loadingIndicator} />
          );
        } else if (
          isPartOfIndexScreen &&
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
      stickyHeaderIndices={stickyHeaderIndices}
      style={[styles.container, isPartOfIndexScreen && styles.indexScreenContainer, containerStyle]}
    />
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(16)
  },
  contentContainerStyle: {
    flexGrow: 1
  },
  loadingIndicator: {
    margin: normalize(14)
  },
  indexScreenContainer: {
    paddingHorizontal: normalize(8)
  },
  spacer: {
    height: normalize(70)
  }
});

VerticalList.propTypes = {
  containerStyle: PropTypes.object,
  data: PropTypes.array,
  fetchMoreData: PropTypes.func,
  isIndexStartingAt1: PropTypes.bool,
  isLoading: PropTypes.bool,
  ListEmptyComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  ListFooterComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  ListFooterLoadingIndicator: PropTypes.func,
  ListHeaderComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  listType: PropTypes.string,
  navigation: PropTypes.object,
  noOvertitle: PropTypes.bool,
  noSubtitle: PropTypes.bool,
  openWebScreen: PropTypes.func,
  query: PropTypes.string,
  queryVariables: PropTypes.object,
  refetch: PropTypes.func,
  refreshControl: PropTypes.object,
  showBackToTop: PropTypes.bool,
  stickyHeaderIndices: PropTypes.array
};
