import { FlashList } from '@shopify/flash-list';
import PropTypes from 'prop-types';
import React, { useContext, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { consts, normalize } from '../config';
import { sectionEventData } from '../helpers/eventListHelper';
import { useRenderItem } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

import { LoadingSpinner } from './LoadingSpinner';

const { EVENT_SUGGESTION_BUTTON } = consts;

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

const MAX_INITIAL_NUM_TO_RENDER = 15;

export const EventList = ({
  contentContainerStyle,
  data,
  fetchMoreData,
  hasNextPage,
  isFetchingNextPage,
  ListEmptyComponent,
  ListHeaderComponent,
  navigation,
  noSubtitle,
  queryVariables,
  refreshControl
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { sections = {} } = globalSettings;
  const { eventListIntro } = sections;

  const isFetchingMore = useRef(false);
  const sectionedData = useMemo(() => sectionEventData(data), [data]);

  const onEndReached = async () => {
    if (fetchMoreData && hasNextPage && !isFetchingNextPage && !isFetchingMore.current) {
      isFetchingMore.current = true;
      try {
        await fetchMoreData();
      } finally {
        isFetchingMore.current = false;
      }
    }
  };

  const renderItem = useRenderItem(QUERY_TYPES.EVENT_RECORDS, navigation, {
    noSubtitle,
    queryVariables,
    isIndexStartingAt1: true
  });

  const stickyHeaderIndices = sectionedData
    .map((item, index) => {
      if (typeof item === 'string') {
        return index;
      } else {
        return null;
      }
    })
    .filter((item) => item !== null);

  return (
    <>
      <FlashList
        data={sectionedData}
        estimatedItemSize={queryVariables?.limit || MAX_INITIAL_NUM_TO_RENDER}
        getItemType={(item) => {
          // To achieve better performance, specify the type based on the item
          return typeof item === 'string' ? 'sectionHeader' : 'row';
        }}
        keyExtractor={keyExtractor}
        ListFooterComponent={() => {
          if (data?.length >= (queryVariables?.limit || MAX_INITIAL_NUM_TO_RENDER)) {
            if (eventListIntro?.buttonType == EVENT_SUGGESTION_BUTTON.BOTTOM_FLOATING) {
              return (
                <>
                  <LoadingSpinner loading={isFetchingNextPage} />
                  <View style={styles.spacer} />
                </>
              );
            }

            return <LoadingSpinner loading={isFetchingNextPage} />;
          }

          if (eventListIntro?.buttonType == EVENT_SUGGESTION_BUTTON.BOTTOM_FLOATING) {
            return <View style={styles.spacer} />;
          }

          return null;
        }}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={refreshControl}
        renderItem={renderItem}
        stickyHeaderIndices={stickyHeaderIndices}
        contentContainerStyle={{ ...styles.contentContainer, ...contentContainerStyle }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: normalize(16)
  },
  spacer: {
    height: normalize(70)
  }
});

EventList.propTypes = {
  contentContainerStyle: PropTypes.object,
  data: PropTypes.array,
  fetchMoreData: PropTypes.func,
  hasNextPage: PropTypes.bool,
  isFetchingNextPage: PropTypes.bool,
  ListEmptyComponent: PropTypes.object,
  ListHeaderComponent: PropTypes.object,
  navigation: PropTypes.object,
  noSubtitle: PropTypes.bool,
  query: PropTypes.string,
  queryVariables: PropTypes.object,
  refreshControl: PropTypes.object
};
