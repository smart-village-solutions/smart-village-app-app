import { RouteProp } from '@react-navigation/core';
import React, { useCallback, useContext } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { BookmarkContext } from '../../BookmarkProvider';
import { colors, consts, Icon, normalize } from '../../config';
import { useBookmarkedStatus } from '../../hooks';
import { togglePushDeviceAssignment } from '../../pushNotifications';

type Props = {
  route: RouteProp<any, any>;
  style: StyleProp<ViewStyle>;
};

const a11yLabel = consts.a11yLabel;

export const BookmarkHeader = ({ route, style }: Props) => {
  const { toggleBookmark } = useContext(BookmarkContext);

  const suffix = route.params?.suffix ?? '';
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const id = queryVariables.id;
  const bookmarkable = route.params?.bookmarkable ?? true;

  const isBookmarked = useBookmarkedStatus(query, id, suffix);

  const onPress = useCallback(() => {
    toggleBookmark(query, id, suffix);
    togglePushDeviceAssignment(
      id,
      query.charAt(0).toUpperCase() + query.slice(1), // convert first character to uppercase
      isBookmarked ? 'DELETE' : 'POST'
    );
  }, [suffix, id, query]);

  if (!(bookmarkable && query && id)) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={a11yLabel.bookmarkList}
      accessibilityHint={a11yLabel.bookmarkListHint}
    >
      {isBookmarked ? (
        <Icon.HeartFilled color={colors.gray120} style={[styles.icon, style]} />
      ) : (
        <Icon.HeartEmpty color={colors.gray120} style={[styles.icon, style]} />
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
