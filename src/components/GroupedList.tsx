import { FlashList } from '@shopify/flash-list';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize } from '../config';
import { useGroupedData, useRenderItem } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';

import { BackToTop } from './BackToTop';
import { LoadingSpinner } from './LoadingSpinner';
import { SWITCH_BETWEEN_LIST_AND_MAP } from './screens';

const MAX_INITIAL_NUM_TO_RENDER = 15;

const keyExtractor = (item: { id: any }, index: any) => `index${index}-id${item.id}`;

type Props = {
  data: any;
  fetchMoreData: () => Promise<any>;
  isLoading: boolean;
  ListEmptyComponent: React.ReactElement;
  ListFooterComponent: React.ReactElement;
  ListHeaderComponent: React.ReactElement;
  navigation: any;
  query: string;
  queryVariables?: any;
  refreshControl: React.ReactElement;
  showBackToTop: boolean;
};

export const GroupedList = ({
  data,
  fetchMoreData,
  isLoading,
  ListEmptyComponent,
  ListFooterComponent,
  ListHeaderComponent,
  navigation,
  query,
  queryVariables,
  refreshControl,
  showBackToTop
}: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { switchBetweenListAndMap = SWITCH_BETWEEN_LIST_AND_MAP.TOP_FILTER } = settings;
  const [listEndReached, setListEndReached] = useState(false);
  const flatListRef = useRef();
  const groupKey = queryVariables?.groupKey || 'publishedAt';
  const sectionedData = useMemo(
    () => useGroupedData(query, data, groupKey),
    [query, data, groupKey]
  );
  const stickyHeaderIndices = useMemo(
    () =>
      sectionedData
        .map((item, index) => {
          if (typeof item === 'string') {
            return index;
          } else {
            return null;
          }
        })
        .filter((item) => item !== null),
    [sectionedData]
  );

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

  const renderItem = useRenderItem(query, navigation, {
    queryVariables: { ...queryVariables, groupKey }
  });

  return (
    <FlashList
      ref={flatListRef}
      keyExtractor={keyExtractor}
      estimatedItemSize={MAX_INITIAL_NUM_TO_RENDER}
      data={sectionedData}
      renderItem={renderItem}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      stickyHeaderIndices={stickyHeaderIndices}
      ListFooterComponent={() => {
        if (ListFooterComponent) {
          return ListFooterComponent;
        }

        if (data?.length >= MAX_INITIAL_NUM_TO_RENDER) {
          if (!listEndReached) {
            return <LoadingSpinner loading />;
          } else if (listEndReached && showBackToTop) {
            return (
              <>
                <BackToTop
                  onPress={() =>
                    flatListRef.current?.scrollToIndex({
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
        } else if (isLoading) {
          return <LoadingSpinner loading />;
        } else if (
          query == QUERY_TYPES.POINTS_OF_INTEREST &&
          switchBetweenListAndMap == SWITCH_BETWEEN_LIST_AND_MAP.BOTTOM_FLOATING_BUTTON
        ) {
          return <View style={styles.spacer} />;
        }

        return null;
      }}
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
      ItemSeparatorComponent={null}
    />
  );
};

const styles = StyleSheet.create({
  spacer: {
    height: normalize(70)
  }
});
