import { RouteProp } from '@react-navigation/core';
import React, { useCallback, useContext } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { BookmarkContext } from '../../BookmarkProvider';
import { colors, consts, Icon, normalize } from '../../config';
import { useBookmarkedStatus } from '../../hooks';

type Props = {
  route: RouteProp<any, any>;
  style: StyleProp<ViewStyle>;
};

export const BookmarkHeader = ({ route, style }: Props) => {
  const { toggleBookmark } = useContext(BookmarkContext);
  const a11yText = consts.a11yLabel;

  const suffix = route.params?.suffix ?? '';
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const id = queryVariables.id;
  const bookmarkable = route.params?.bookmarkable ?? true;

  const isBookmarked = useBookmarkedStatus(query, id, suffix);

  const onPress = useCallback(() => {
    toggleBookmark(query, id, suffix);
  }, [suffix, id, query]);

  if (!(bookmarkable && query && queryVariables?.id)) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={a11yText.bookmarkList}
      accessibilityHint={a11yText.bookmarkListHint}
    >
      {isBookmarked ? (
        <Icon.HeartFilled color={colors.lightestText} style={[styles.icon, style]} />
      ) : (
        <Icon.HeartEmpty color={colors.lightestText} style={[styles.icon, style]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(7),
    paddingVertical: normalize(4)
  }
});
