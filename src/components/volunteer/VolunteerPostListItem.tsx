import React, { useEffect, useState } from 'react';
import { Image as RNImage, StyleSheet } from 'react-native';
import { Badge, ListItem } from 'react-native-elements';
import Lightbox from 'react-native-lightbox-v2';
import Markdown from 'react-native-markdown-display';

import { colors, styles as configStyles, device, Icon, normalize } from '../../config';
import {
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
    content: {
      files: {
        guid: string;
        id: number;
        mime_type: string;
      }[];
      metadata: { created_by: { guid: string; display_name: string }; created_at: string };
    };
    id: number;
    message: string;
  };
  setIsCollapsed: (isCollapsed: boolean) => void;
  setPostForModal: (post: {
    files: {
      guid: string;
      id: number;
      mime_type: string;
    }[];
    id: number;
    message: string;
  }) => void;
  userGuid?: string | null;
}) => {
  const { metadata, files } = content || {};
  const {
    created_by: { guid, display_name: displayName },
    created_at: createdAt
  } = metadata || { guid: '', display_name: '' };
  const isUserAuthor = userGuid == guid;

  const [filesWithImages, setFilesWithImages] = useState([]);
  const [aspectRatios, setAspectRatios] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (!authToken || !files) return;

    const filesWithImageUriAndHeader = files
      .filter((file) => file.mime_type.startsWith('image/'))
      .map((file) => ({
        ...file,
        uri: `${volunteerApiV1Url}file/download/${file.id}`,
        headers: { Authorization: `Bearer ${authToken}` }
      }));

    filesWithImageUriAndHeader?.forEach(({ guid, id, uri, headers }) => {
      RNImage.getSizeWithHeaders(
        uri,
        headers,
        (width, height) => {
          setAspectRatios((prev) => ({
            ...prev,
            [guid]: width / height
          }));
        },
        () => console.warn('Could not get size for image', id)
      );
    });

    setFilesWithImages(filesWithImageUriAndHeader);
  }, [authToken, files]);

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
              setPostForModal({ id, message, files });
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

      {filesWithImages?.map((file) => {
        const imageSource = {
          uri: `${volunteerApiV1Url}file/download/${file.id}`,
          headers: { Authorization: `Bearer ${authToken}` }
        };

        return (
          <ListItem
            bottomDivider={bottomDivider}
            containerStyle={[styles.filesContainerStyle, styles.paddingBottom]}
            key={file.guid}
          >
            <Lightbox
              renderContent={() => (
                <Image
                  childrenContainerStyle={stylesWithProps().imageLightbox}
                  containerStyle={styles.imageContainer}
                  source={imageSource}
                  resizeMode="contain"
                />
              )}
              underlayColor={colors.transparent}
            >
              <Image
                borderRadius={normalize(8)}
                childrenContainerStyle={{
                  ...stylesWithProps().image,
                  aspectRatio: aspectRatios[file.guid] || undefined
                }}
                containerStyle={styles.imageContainer}
                source={imageSource}
                resizeMode="contain"
              />
            </Lightbox>
          </ListItem>
        );
      })}
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
      maxHeight: normalize(250),
      width: maxWidth
    },
    imageLightbox: {
      height: device.height * 0.9,
      width: device.width * 0.9
    }
  });
};
