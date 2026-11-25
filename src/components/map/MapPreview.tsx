import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { normalize } from '../../config';
import { TextListItem } from '../TextListItem';

type Props = Pick<React.ComponentProps<typeof TextListItem>, 'item' | 'navigation' | 'disabled'> & {
  children?: React.ReactNode;
};

// Shared map preview: callers supply data, navigation and optional additional content.
export const MapPreview = ({ item, navigation, disabled, children }: Props) => (
  <ScrollView style={styles.preview} contentContainerStyle={styles.content} nestedScrollEnabled>
    <TextListItem
      containerStyle={styles.row}
      disabled={disabled}
      imageStyle={styles.image}
      item={{ ...item, bottomDivider: false }}
      leftImage={!!item.picture?.url}
      listsWithoutArrows
      navigation={navigation}
    />
    {children}
  </ScrollView>
);

const styles = StyleSheet.create({
  preview: { maxHeight: normalize(300) },
  content: { padding: normalize(16) },
  row: { alignItems: 'flex-start', paddingHorizontal: 0, paddingVertical: 0 },
  image: { height: normalize(96), width: normalize(96) }
});
