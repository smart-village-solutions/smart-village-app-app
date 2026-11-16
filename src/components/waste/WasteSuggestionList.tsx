import React, { useState } from 'react';
import { FlatListProps } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { texts } from '../../config';
import { Button } from '../Button';

// Autocomplete expects a FlatList renderer. Use a ScrollView for its bounded dropdown
// so it can live inside the scrollable address form without nesting virtualized lists.
const separators = {
  highlight: () => {},
  unhighlight: () => {},
  updateProps: () => {}
};

const BATCH_SIZE = 50;

export const WasteSuggestionList = <Item,>({
  data,
  keyExtractor,
  renderItem,
  style
}: FlatListProps<Item>) => {
  const [batch, setBatch] = useState({ data, limit: BATCH_SIZE });
  // A new query starts with a small batch again, even after expanding the previous results.
  const limit = batch.data === data ? batch.limit : BATCH_SIZE;
  const visibleItems = Array.from(
    { length: Math.min(data?.length ?? 0, limit) },
    (_, index) => data![index]
  );

  return (
    <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={style}>
      {visibleItems.map((item, index) => (
        <React.Fragment key={keyExtractor?.(item, index) ?? index}>
          {renderItem?.({ item, index, separators })}
        </React.Fragment>
      ))}
      {(data?.length ?? 0) > limit && (
        <Button
          onPress={() => setBatch({ data, limit: limit + BATCH_SIZE })}
          small
          title={texts.accessibilityLabels.actions.loadMore}
        />
      )}
    </ScrollView>
  );
};
