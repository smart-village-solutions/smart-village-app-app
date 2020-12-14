import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, normalize } from '../../config';
import { getBookmarkedStatus, toggleBookmark } from '../../helpers/bookmarkHelpers';
import { starEmpty } from '../../icons/starEmpty';
import { starFilled } from '../../icons/starFilled';
import { QUERY_TYPES } from '../../queries';
import { Icon } from '../Icon';

type Props = {
  id: string;
  categoryId: number
  query: keyof typeof QUERY_TYPES;
  style: object | undefined;
}

export const BookmarkHeader = ({ id, categoryId, query, style }: Props) => {
  const [isBookmarked, setIsBookmarked] = useState<boolean>();

  const onPress = useCallback(() => {
    toggleBookmark(query, id, categoryId);
    setIsBookmarked((value) => !value);
  }, [id, query, setIsBookmarked]);

  const updateBookmarkedStatus = useCallback(async () => {
    setIsBookmarked(await getBookmarkedStatus(query, id, categoryId));
  }, [setIsBookmarked]);

  useEffect(() => {
    updateBookmarkedStatus();
  }, [updateBookmarkedStatus]);

  if(isBookmarked === undefined) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel="Merkliste (Taste)"
      accessibilityHint="Zu der Merkliste hinzufügen"
    >
      <Icon xml={isBookmarked ? starFilled(colors.lightestText) : starEmpty(colors.lightestText)} style={{...styles.icon, ...style}} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(7),
    paddingVertical: normalize(4)
  }
});
