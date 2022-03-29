import moment from 'moment';
import 'moment/locale/de';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import Markdown from 'react-native-markdown-display';

import { colors, normalize, styles } from '../../config';
import { openLink } from '../../helpers';
import { useOpenWebScreen } from '../../hooks';
import { BoldText, RegularText } from '../Text';

import { VolunteerAvatar } from './VolunteerAvatar';

export const VolunteerPostListItem = ({
  post: {
    id,
    message,
    content: {
      metadata: {
        created_by: { guid, display_name: displayName },
        created_at: createdAt
      }
    }
  },
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
}) => (
  <View>
    <ListItem
      leftAvatar={<VolunteerAvatar item={{ user: { guid, display_name: displayName } }} />}
      title={<BoldText>{displayName}</BoldText>}
      subtitle={
        <RegularText small>{moment.utc(createdAt).local().format('DD.MM.YYYY HH:mm')}</RegularText>
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
