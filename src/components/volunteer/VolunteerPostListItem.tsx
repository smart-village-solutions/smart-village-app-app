import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import Markdown from 'react-native-markdown-display';

import { colors, normalize, styles } from '../../config';
import { momentFormat, openLink, volunteerListDate } from '../../helpers';
import { BoldText, RegularText } from '../Text';

import { VolunteerAvatar } from './VolunteerAvatar';

export const VolunteerPostListItem = ({
  bottomDivider = true,
  openWebScreen,
  post: { message, content }
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
}) => {
  const { metadata } = content || {};
  const {
    created_by: { guid, display_name: displayName },
    created_at: createdAt
  } = metadata || { guid: '', display_name: '' };

  return (
    <>
      <ListItem containerStyle={listItemStyles.avatarContainerStyle}>
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
      </ListItem>

      <ListItem bottomDivider={bottomDivider} containerStyle={listItemStyles.contentContainerStyle}>
        <Markdown
          onLinkPress={(url) => {
            openLink(url, openWebScreen);
            return false;
          }}
          style={styles.markdown}
        >
          {message}
        </Markdown>
      </ListItem>
    </>
  );
};

const listItemStyles = StyleSheet.create({
  avatarContainerStyle: {
    backgroundColor: colors.transparent,
    paddingBottom: 0,
    paddingHorizontal: normalize(0),
    paddingVertical: normalize(12)
  },
  contentContainerStyle: {
    backgroundColor: colors.transparent,
    paddingHorizontal: normalize(0),
    paddingVertical: normalize(12)
  }
});
