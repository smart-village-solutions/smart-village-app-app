import { StackScreenProps } from '@react-navigation/stack';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useState } from 'react';

import { useRenderItem } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { TVoucherItem } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';

const keyExtractor = (item: TVoucherItem, index: number) => `index${index}-id${item.id}`;

const MAX_INITIAL_NUM_TO_RENDER = 15;

const sectionData = (data: TVoucherItem[]) => {
  const groupDataByCategory = (data: TVoucherItem[]) => {
    const grouped = {};

    data?.forEach((item: TVoucherItem) => {
      if (item.categories?.length) {
        if (!grouped[item.categories[0].name]) {
          grouped[item.categories[0].name] = [];
        }
        grouped[item.categories[0].name].push(item);
      }
    });

    return grouped;
  };

  const transformGroupedDataToArray = (groupedData) => {
    const resultArray = [];

    for (const category in groupedData) {
      resultArray.push({ name: category, id: groupedData?.[category]?.[0]?.categories?.[0]?.id });
      resultArray.push(...groupedData[category]);
    }

    return resultArray;
  };

  const groupedByCategory = groupDataByCategory(data);

  // sort the groupDataByCategory object by its string keys alphabetically
  const orderedGroupedByCategory = Object.keys(groupedByCategory)
    .sort()
    .reduce((obj, key) => {
      obj[key] = groupedByCategory[key];

      return obj;
    }, {});

  return transformGroupedDataToArray(orderedGroupedByCategory);
};

export const VoucherList = ({
  data,
  fetchMoreData,
  ListEmptyComponent,
  ListHeaderComponent,
  navigation,
  noSubtitle,
  query,
  queryVariables,
  refreshControl
}: {
  data: TVoucherItem[];
  fetchMoreData: () => Promise<any>;
  ListEmptyComponent: React.ReactElement;
  ListHeaderComponent: React.ReactElement;
  navigation: StackScreenProps<any>;
  noSubtitle: boolean;
  query: string;
  queryVariables: any;
  refreshControl: React.ReactElement;
}) => {
  const [listEndReached, setListEndReached] = useState(false);
  const [sectionedData, setSectionedData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setRefreshing(true);
    setSectionedData(sectionData(data));
    setRefreshing(false);
  }, [data]);

  const onEndReached = async () => {
    if (fetchMoreData) {
      // if there is a pagination, the end of the list is reached, when no more data is returned
      // from partially fetching, so we need to check the data to determine the lists end
      const { data: moreData } = await fetchMoreData();

      setListEndReached(
        !moreData[
          query == QUERY_TYPES.VOUCHERS_REDEEMED ? QUERY_TYPES.VOUCHERS : QUERY_TYPES.GENERIC_ITEMS
        ].length
      );
    } else {
      setListEndReached(true);
    }
  };

  const renderItem = useRenderItem(query, navigation, {
    noSubtitle,
    queryVariables
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

  console.warn(data?.length, { data });

  return (
    <FlashList
      data={sectionedData}
      refreshing={refreshing}
      estimatedItemSize={MAX_INITIAL_NUM_TO_RENDER}
      keyExtractor={keyExtractor}
      ListFooterComponent={() => {
        if (data?.length >= MAX_INITIAL_NUM_TO_RENDER) {
          return <LoadingSpinner loading={!listEndReached} />;
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
    />
  );
};
