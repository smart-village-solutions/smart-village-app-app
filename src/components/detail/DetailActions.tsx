import { RouteProp } from 'expo-router/react-navigation';
import React, { useMemo } from 'react';
import { ShareContent, ViewStyle } from 'react-native';
import { Divider } from 'react-native-elements';

import { normalize, texts } from '../../config';
import { shareMessage } from '../../helpers/shareHelper';
import { useTheme } from '../../hooks/useTheme';
import { BookmarkHeader } from '../bookmarks';
import { ShareHeader } from '../ShareHeader';
import { WrapperHorizontal } from '../Wrapper';

type DetailRouteParams = {
  bookmarkable?: boolean;
  query?: string;
  queryVariables?: { id?: string };
  shareContent?: ShareContent;
  title?: string;
};

type Props = {
  data?: Record<string, unknown>;
  route: RouteProp<Record<string, DetailRouteParams | undefined>, string>;
  shareContent?: ShareContent;
  suffix?: number | string;
};

const resolveShareContent = (
  shareContent: ShareContent | undefined,
  routeShareContent: ShareContent | undefined,
  data: Record<string, unknown> | undefined,
  query: string | undefined
) => {
  if (shareContent) return shareContent;
  if (routeShareContent) return routeShareContent;
  if (!data?.id || !query) return;

  return { message: shareMessage(data, query) };
};

export const DetailActions = ({ data, route, shareContent, suffix }: Props) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const query = route.params?.query;
  const id = route.params?.queryVariables?.id;
  const resolvedShareContent = resolveShareContent(
    shareContent,
    route.params?.shareContent,
    data,
    query
  );
  const showBookmark = route.params?.bookmarkable !== false && !!query && id !== undefined;
  const showShare = !!resolvedShareContent;
  const detailTitle = route.params?.title?.trim();
  const bookmarkLabel = detailTitle
    ? texts.detailActions.remember.replace('{{title}}', detailTitle)
    : texts.detailActions.rememberFallback;
  const shareLabel = detailTitle
    ? texts.detailActions.share.replace('{{title}}', detailTitle)
    : texts.detailActions.shareFallback;

  if (!showBookmark && !showShare) return null;

  return (
    <WrapperHorizontal accessibilityRole="toolbar" style={styles.container}>
      {showBookmark && (
        <BookmarkHeader
          buttonStyle={styles.actionButton}
          label={bookmarkLabel}
          route={route}
          style={styles.actionIcon}
          suffix={suffix}
        />
      )}

      {showBookmark && showShare && <Divider style={styles.divider} />}

      {showShare && (
        <ShareHeader
          buttonStyle={styles.actionButton}
          label={shareLabel}
          shareContent={resolvedShareContent}
          style={styles.actionIcon}
        />
      )}
    </WrapperHorizontal>
  );
};

const createStyles = (colors: Record<string, string>): Record<string, ViewStyle> => ({
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    minHeight: 48,
    paddingVertical: normalize(16),
    width: '100%'
  },
  actionIcon: {
    marginRight: normalize(12),
    paddingHorizontal: 0
  },
  container: {
    alignItems: 'flex-start',
    width: '100%'
  },
  divider: {
    backgroundColor: colors.placeholder,
    marginVertical: normalize(4),
    width: '100%'
  }
});
