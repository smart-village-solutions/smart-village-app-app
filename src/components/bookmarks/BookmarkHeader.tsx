import React, { useCallback, useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { BookmarkContext } from '../../BookmarkProvider';

import { colors, normalize } from '../../config';
import { useBookmarkedStatus } from '../../hooks';
import { heartEmpty, heartFilled } from '../../icons';
import { QUERY_TYPES } from '../../queries';
import { Icon } from '../Icon';

type Props = {
  id: string;
  categoryId: number
  query: keyof typeof QUERY_TYPES;
  style: object | undefined;
}

export const BookmarkHeader = ({ id, categoryId, query, style }: Props) => {
  const { toggleBookmark } = useContext(BookmarkContext);
  const isBookmarked = useBookmarkedStatus(query, id, categoryId);

  const onPress = useCallback(() => {
    toggleBookmark(query, id, categoryId);
  }, [categoryId, id, query]);

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel="Merkliste (Taste)"
      accessibilityHint="Zu der Merkliste hinzufügen"
    >
      <Icon
        size={normalize(22)}
        xml={isBookmarked ?
          heartFilled(colors.lightestText) :
          heartEmpty(colors.lightestText)}
        style={{...styles.icon, ...style}}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(7),
    paddingVertical: normalize(4)
  }
});
