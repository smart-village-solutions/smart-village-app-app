import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import Markdown from 'react-native-markdown-display';

import { colors, normalize, styles } from '../../config';
import { momentFormat, openLink, volunteerListDate } from '../../helpers';
import { BoldText, RegularText } from '../Text';

import { VolunteerAvatar } from './VolunteerAvatar';

export const VolunteerPostListItem = ({
  post: { message, content },
  bottomDivider = true,
  openWebScreen
}: {
  post: {
    id: number;
    message: string;
    content: {
      metadata: { created_by: { guid: string; display_name: string }; created_at: string };
    };
  };
  bottomDivider: boolean;
  openWebScreen: (webUrl: string, specificTitle?: string | undefined) => void;
}) => {
  const { metadata } = content || {};
  const {
    created_by: { guid, display_name: displayName },
    created_at: createdAt
  } = metadata || { guid: '', display_name: '' };

  return (
    <View>
      <ListItem
        leftAvatar={<VolunteerAvatar item={{ user: { guid, display_name: displayName } }} />}
        title={<BoldText>{displayName}</BoldText>}
        subtitle={
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
        }
        containerStyle={listItemStyles.avatarContainerStyle}
      />
      <ListItem
        title={
          <Markdown
            onLinkPress={(url) => {
              openLink(url, openWebScreen);
              return false;
            }}
            style={styles.markdown}
          >
            {message}
          </Markdown>
        }
        bottomDivider={bottomDivider}
        containerStyle={listItemStyles.contentContainerStyle}
      />
    </View>
  );
};

const listItemStyles = StyleSheet.create({
  avatarContainerStyle: {
    backgroundColor: colors.transparent,
    paddingBottom: 0,
    paddingVertical: normalize(12)
  },
  contentContainerStyle: {
    backgroundColor: colors.transparent,
    paddingVertical: normalize(12)
  }
});
