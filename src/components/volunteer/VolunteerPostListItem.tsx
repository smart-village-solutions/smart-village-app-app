import React from 'react';
import { StyleSheet } from 'react-native';
import { Badge, ListItem } from 'react-native-elements';
import Markdown from 'react-native-markdown-display';

import { colors, styles as configStyles, Icon, normalize } from '../../config';
import { momentFormat, openLink, volunteerListDate } from '../../helpers';
import { BoldText, RegularText } from '../Text';

import { VolunteerAvatar } from './VolunteerAvatar';

export const VolunteerPostListItem = ({
  bottomDivider = true,
  openWebScreen,
  post: { message, content },
  userGuid
}: {
  bottomDivider: boolean;
  openWebScreen: (webUrl: string, specificTitle?: string | undefined) => void;
  post: {
    id: number;
    message: string;
    content: {
      metadata: { created_by: { guid: string; display_name: string }; created_at: string };
    };
  };
  userGuid?: string | null;
}) => {
  const { metadata } = content || {};
  const {
    created_by: { guid, display_name: displayName },
    created_at: createdAt
  } = metadata || { guid: '', display_name: '' };
  const isUserAuthor = userGuid == guid;

  return (
    <>
      <ListItem containerStyle={styles.avatarContainerStyle}>
        <VolunteerAvatar item={{ user: { guid, display_name: displayName } }} />

        <ListItem.Content>
          <BoldText>{displayName}</BoldText>
          <RegularText small>
            {momentFormat(
              volunteerListDate({
                end_datetime: '',
                start_datetime: '',
                updated_at: createdAt
              }),
              'DD.MM.YYYY HH:mm'
            )}
          </RegularText>
        </ListItem.Content>

        {isUserAuthor && (
          <Badge
            badgeStyle={styles.badge}
            value={<Icon.Pen color={colors.darkText} size={normalize(16)} />}
            onPress={() => {
              alert(1);
            }}
          />
        )}
      </ListItem>

      <ListItem bottomDivider={bottomDivider} containerStyle={styles.contentContainerStyle}>
        <Markdown
          onLinkPress={(url) => {
            openLink(url, openWebScreen);
            return false;
          }}
          style={configStyles.markdown}
        >
          {message}
        </Markdown>
      </ListItem>
    </>
  );
};

const styles = StyleSheet.create({
  avatarContainerStyle: {
    backgroundColor: colors.transparent,
    paddingBottom: 0,
    paddingHorizontal: normalize(0),
    paddingVertical: normalize(12)
  },
  badge: {
    backgroundColor: colors.gray20,
    borderRadius: normalize(40),
    height: normalize(40),
    width: normalize(40)
  },
  contentContainerStyle: {
    backgroundColor: colors.transparent,
    paddingHorizontal: normalize(0),
    paddingVertical: normalize(12)
  }
});
