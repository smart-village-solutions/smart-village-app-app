import { RouteProp } from '@react-navigation/native';
import React from 'react';
import { ShareContent, View, ViewStyle } from 'react-native';

import { normalize } from '../../config';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { BookmarkHeader } from '../bookmarks';
import { ShareHeader } from '../ShareHeader';

type DetailRouteParams = {
  bookmarkable?: boolean;
  query?: string;
  queryVariables?: { id?: string };
  shareContent?: ShareContent;
};

type Props = {
  route: RouteProp<Record<string, DetailRouteParams | undefined>, string>;
  shareContent?: ShareContent;
};

export const DetailActions = ({ route, shareContent = route.params?.shareContent }: Props) => {
  const styles = useThemeStyles(createStyles);

  const query = route.params?.query;
  const id = route.params?.queryVariables?.id;
  const showBookmark = route.params?.bookmarkable !== false && !!query && id !== undefined;
  const showShare = !!shareContent;

  if (!showBookmark && !showShare) return null;

  return (
    <View accessibilityRole="toolbar" style={styles.container}>
      {showBookmark && (
        <BookmarkHeader buttonStyle={styles.actionButton} route={route} style={styles.actionIcon} />
      )}

      {showShare && (
        <ShareHeader
          buttonStyle={styles.actionButton}
          shareContent={shareContent}
          style={styles.actionIcon}
        />
      )}
    </View>
  );
};

const ACTION_SIZE = normalize(44);

const createStyles = (): Record<string, ViewStyle> => ({
  actionButton: {
    alignItems: 'center',
    borderRadius: ACTION_SIZE / 2,
    height: ACTION_SIZE,
    justifyContent: 'center',
    marginHorizontal: normalize(4),
    width: ACTION_SIZE
  },

  actionIcon: {
    paddingHorizontal: 0
  },

  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: normalize(16),
    paddingTop: normalize(4)
  }
});
