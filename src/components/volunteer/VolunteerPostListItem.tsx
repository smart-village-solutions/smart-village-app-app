import React from 'react';
import { StyleSheet } from 'react-native';
import { Badge, ListItem } from 'react-native-elements';
import Markdown from 'react-native-markdown-display';

import { colors, styles as configStyles, Icon, normalize } from '../../config';
import {
  imageHeight,
  imageWidth,
  momentFormat,
  openLink,
  volunteerApiV1Url,
  volunteerListDate
} from '../../helpers';
import { Image } from '../Image';
import { BoldText, RegularText } from '../Text';

import { VolunteerAvatar } from './VolunteerAvatar';

export const VolunteerPostListItem = ({
  authToken,
  bottomDivider = true,
  openWebScreen,
  post: { id, message, content },
  setIsCollapsed,
  setPostForModal,
  userGuid
}: {
  authToken: string | null;
  bottomDivider: boolean;
  openWebScreen: (webUrl: string, specificTitle?: string | undefined) => void;
  post: {
    id: number;
    message: string;
    content: {
      metadata: { created_by: { guid: string; display_name: string }; created_at: string };
      files: {
        id: number;
        guid: string;
        mime_type: string;
        size: number;
        file_name: string;
        url: string;
      }[];
    };
  };
  setIsCollapsed: (isCollapsed: boolean) => void;
  setPostForModal: (post: { id: number; message: string }) => void;
  userGuid?: string | null;
}) => {
  const { metadata, files } = content || {};
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
              setPostForModal({ id, message });
              setIsCollapsed(false);
            }}
          />
        )}
      </ListItem>

      <ListItem
        containerStyle={[styles.contentContainerStyle, !files.length && styles.paddingBottom]}
      >
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

      {files
        ?.filter((file) => file.mime_type.startsWith('image/'))
        ?.map((file) => (
          <ListItem
            bottomDivider={bottomDivider}
            containerStyle={[styles.filesContainerStyle, styles.paddingBottom]}
            key={file.guid}
          >
            <Image
              borderRadius={normalize(8)}
              childrenContainerStyle={stylesWithProps().image}
              containerStyle={styles.imageContainer}
              source={{
                uri: `${volunteerApiV1Url}file/download/${file.id}`,
                headers: {
                  Authorization: authToken ? `Bearer ${authToken}` : ''
                }
              }}
            />
          </ListItem>
        ))}
    </>
  );
};

const styles = StyleSheet.create({
  avatarContainerStyle: {
    backgroundColor: colors.transparent,
    paddingBottom: 0,
    paddingHorizontal: 0,
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
    paddingHorizontal: 0,
    paddingBottom: 0,
    paddingTop: normalize(12)
  },
  filesContainerStyle: {
    backgroundColor: colors.transparent,
    paddingHorizontal: normalize(0),
    paddingTop: 0
  },
  imageContainer: {
    alignSelf: 'center'
  },
  paddingBottom: {
    paddingBottom: normalize(12)
  }
});

const stylesWithProps = () => {
  const maxWidth = imageWidth() - 2 * normalize(16); // width of an image minus paddings

  return StyleSheet.create({
    image: {
      height: imageHeight(maxWidth),
      width: maxWidth
    }
  });
};
