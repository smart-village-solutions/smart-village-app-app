import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { normalize } from '../../config';
import { TextListItem } from '../TextListItem';

export const SearchResultSectionList = ({
  data,
  listsWithoutArrows,
  navigation,
  noOvertitle,
  noSubtitle
}: {
  data: any[];
  listsWithoutArrows?: boolean;
  navigation: any;
  noOvertitle?: boolean;
  noSubtitle?: boolean;
}) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item: { id: any }, index: any) => `index${index}-id${item.id}`}
      renderItem={({ item }) => (
        <TextListItem
          item={{
            ...item,
            bottomDivider: true
          }}
          {...{
            leftImage: true,
            listsWithoutArrows,
            navigation,
            noOvertitle,
            noSubtitle
          }}
        />
      )}
      scrollEnabled={false}
      style={styles.searchResultsListContainer}
    />
  );
};

const styles = StyleSheet.create({
  searchResultsListContainer: {
    paddingHorizontal: normalize(16)
  }
});
