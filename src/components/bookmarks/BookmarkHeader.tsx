import { RouteProp } from '@react-navigation/core';
import React, { useCallback, useContext } from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { BookmarkContext } from '../../BookmarkProvider';
import { consts } from '../../config';
import { useBookmarkedStatus } from '../../hooks';
import { useTheme } from '../../hooks/useTheme';
import { togglePushDeviceAssignment } from '../../pushNotifications';
import { RegularText } from '../Text';

import { ConfiguredBookmarkIcon } from './BookmarkIcon';

type Props = {
  buttonStyle?: StyleProp<ViewStyle>;
  label?: string;
  route: RouteProp<Record<string, BookmarkRouteParams | undefined>, string>;
  style?: StyleProp<ViewStyle>;
};

type BookmarkRouteParams = {
  bookmarkable?: boolean;
  query?: string;
  queryVariables?: { id?: string };
  suffix?: number | string;
};

const a11yLabel = consts.a11yLabel;

const BookmarkLabel = ({ label }: { label?: string }) =>
  label ? <RegularText primary>{label}</RegularText> : null;

const getIconColor = (label: string | undefined, colors: ReturnType<typeof useTheme>['colors']) =>
  label ? colors.primary : colors.darkText;

export const BookmarkHeader = ({ buttonStyle, label, route, style }: Props) => {
  const { colors } = useTheme();

  const { toggleBookmark } = useContext(BookmarkContext);

  const suffix = route.params?.suffix ?? '';
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const id = queryVariables.id ?? '';
  const bookmarkable = route.params?.bookmarkable ?? true;

  const isBookmarked = useBookmarkedStatus(query, id, suffix);

  const onPress = useCallback(() => {
    toggleBookmark(query, id, suffix);
    togglePushDeviceAssignment(
      id,
      query.charAt(0).toUpperCase() + query.slice(1), // convert first character to uppercase
      isBookmarked ? 'DELETE' : 'POST'
    );
  }, [id, isBookmarked, query, suffix, toggleBookmark]);

  if (!(bookmarkable && query && id)) {
    return null;
  }

  const iconColor = getIconColor(label, colors);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label || a11yLabel.bookmarkList}
      accessibilityHint={a11yLabel.bookmarkListHint}
      accessibilityState={{ selected: isBookmarked }}
      onPress={onPress}
      style={buttonStyle}
    >
      <ConfiguredBookmarkIcon color={iconColor} selected={isBookmarked} style={style} />
      <BookmarkLabel label={label} />
    </TouchableOpacity>
  );
};
