import { RouteProp } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { ShareContent, View, ViewStyle } from 'react-native';

import { Divider } from 'react-native-elements';
import { normalize, texts } from '../../config';
import { useTheme } from '../../hooks/useTheme';
import { BookmarkHeader } from '../bookmarks';
import { ShareHeader } from '../ShareHeader';

type DetailRouteParams = {
  bookmarkable?: boolean;
  query?: string;
  queryVariables?: { id?: string };
  shareContent?: ShareContent;
  title?: string;
};

type Props = {
  route: RouteProp<Record<string, DetailRouteParams | undefined>, string>;
  shareContent?: ShareContent;
};

export const DetailActions = ({ route, shareContent = route.params?.shareContent }: Props) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const query = route.params?.query;
  const id = route.params?.queryVariables?.id;
  const showBookmark = route.params?.bookmarkable !== false && !!query && id !== undefined;
  const showShare = !!shareContent;
  const detailTitle = route.params?.title?.trim();
  const bookmarkLabel = detailTitle
    ? texts.detailActions.remember.replace('{{title}}', detailTitle)
    : texts.detailActions.rememberFallback;
  const shareLabel = detailTitle
    ? texts.detailActions.share.replace('{{title}}', detailTitle)
    : texts.detailActions.shareFallback;

  if (!showBookmark && !showShare) return null;

  return (
    <View accessibilityRole="toolbar" style={styles.container}>
      {showBookmark && (
        <>
          <BookmarkHeader
            buttonStyle={styles.actionButton}
            label={bookmarkLabel}
            route={route}
            style={styles.actionIcon}
          />

          <Divider style={styles.divider} />
        </>
      )}

      {showShare && (
        <ShareHeader
          buttonStyle={styles.actionButton}
          label={shareLabel}
          shareContent={shareContent}
          style={styles.actionIcon}
        />
      )}
    </View>
  );
};

const createStyles = (colors: Record<string, string>): Record<string, ViewStyle> => ({
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: normalize(44),
    paddingVertical: normalize(8),
    width: '100%'
  },
  actionIcon: {
    marginRight: normalize(12),
    paddingHorizontal: 0
  },
  container: {
    alignItems: 'flex-start',
    paddingBottom: normalize(16),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(4),
    width: '100%'
  },
  divider: {
    backgroundColor: colors.placeholder,
    marginVertical: normalize(4),
    width: '100%'
  }
});
