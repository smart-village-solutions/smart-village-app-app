import { RouteProp } from '@react-navigation/core';
import React, { useCallback, useContext } from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { BookmarkContext } from '../../BookmarkProvider';
import { consts, Icon } from '../../config';
import { useBookmarkedStatus } from '../../hooks';
import { togglePushDeviceAssignment } from '../../pushNotifications';
import { HEADER_RIGHT_ICON_STROKE_WIDTH } from '../headerIconConfig';
import { useTheme } from '../../hooks/useTheme';

type Props = {
  buttonStyle?: StyleProp<ViewStyle>;
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

export const BookmarkHeader = ({ buttonStyle, route, style }: Props) => {
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

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={a11yLabel.bookmarkList}
      accessibilityHint={a11yLabel.bookmarkListHint}
      accessibilityState={{ selected: isBookmarked }}
      onPress={onPress}
      style={buttonStyle}
    >
      {isBookmarked ? (
        <Icon.HeartFilled
          color={colors.darkText}
          style={style}
          hasNoHitSlop
          strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
        />
      ) : (
        <Icon.HeartEmpty
          color={colors.darkText}
          style={style}
          hasNoHitSlop
          strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
        />
      )}
    </TouchableOpacity>
  );
};
