import React from 'react';
import { FlatListProps } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

// Autocomplete expects a FlatList renderer. Use a ScrollView for its bounded dropdown
// so it can live inside the scrollable address form without nesting virtualized lists.
const separators = {
  highlight: () => {},
  unhighlight: () => {},
  updateProps: () => {}
};

export const WasteSuggestionList = <Item,>({
  data,
  keyExtractor,
  renderItem,
  style
}: FlatListProps<Item>) => (
  <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={style}>
    {Array.from(data ?? []).map((item, index) => (
      <React.Fragment key={keyExtractor?.(item, index) ?? index}>
        {renderItem?.({ item, index, separators })}
      </React.Fragment>
    ))}
  </ScrollView>
);
