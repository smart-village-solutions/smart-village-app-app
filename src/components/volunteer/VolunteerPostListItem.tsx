import moment from 'moment';
import 'moment/locale/de';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, normalize } from '../../config';
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
  bottomDivider = true
}: {
  post: {
    id: number;
    message: string;
    content: {
      metadata: { created_by: { guid: string; display_name: string }; created_at: string };
    };
  };
  bottomDivider: boolean;
}) => {
  return (
    <View>
      <ListItem
        leftAvatar={<VolunteerAvatar item={{ user: { guid, display_name: displayName } }} />}
        title={<BoldText>{displayName}</BoldText>}
        subtitle={
          <RegularText small>
            {moment.utc(createdAt).local().format('DD.MM.YYYY HH:mm')}
          </RegularText>
        }
        containerStyle={styles.avatarContainerStyle}
      />
      <ListItem
        title={<RegularText>{message}</RegularText>}
        bottomDivider={bottomDivider}
        containerStyle={styles.contentContainerStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
