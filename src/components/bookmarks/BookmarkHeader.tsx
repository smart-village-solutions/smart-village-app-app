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
  suffix?: number | string;
  query: keyof typeof QUERY_TYPES;
  style: Record<string, unknown> | undefined;
};

export const BookmarkHeader = ({ id, suffix, query, style }: Props) => {
  const { toggleBookmark } = useContext(BookmarkContext);
  const isBookmarked = useBookmarkedStatus(query, id, suffix);

  const onPress = useCallback(() => {
    toggleBookmark(query, id, suffix);
  }, [suffix, id, query]);

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel="Lesezeichenliste (Taste)"
      accessibilityHint="Zu der Lesezeichenliste hinzufügen"
    >
      <Icon
        size={normalize(22)}
        xml={isBookmarked ? heartFilled(colors.lightestText) : heartEmpty(colors.lightestText)}
        style={{ ...styles.icon, ...style }}
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
