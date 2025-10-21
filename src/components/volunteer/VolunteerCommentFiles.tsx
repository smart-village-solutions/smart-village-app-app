import React, { useEffect, useState } from 'react';
import { Image as RNImage, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import Lightbox from 'react-native-lightbox-v2';

import { colors, device, normalize } from '../../config';
import { imageWidth, volunteerApiV1Url } from '../../helpers';
import { VolunteerFileObject } from '../../types';
import { Image } from '../Image';

export const VolunteerCommentFiles = ({
  authToken,
  files,
  isAnswer
}: {
  authToken: string | null;
  files: VolunteerFileObject[];
  isAnswer: boolean;
}) => {
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

  return filesWithImages?.map((file) => {
    const imageSource = {
      uri: `${volunteerApiV1Url}file/download/${file.id}`,
      headers: { Authorization: `Bearer ${authToken}` }
    };

    return (
      <ListItem
        bottomDivider={false}
        containerStyle={[styles.filesContainerStyle, styles.paddingBottom]}
        key={file.guid}
      >
        <Lightbox
          renderContent={() => (
            <Image
              childrenContainerStyle={stylesWithProps({ isAnswer }).imageLightbox}
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
              ...stylesWithProps({ isAnswer }).image,
              aspectRatio: aspectRatios[file.guid] || undefined
            }}
            containerStyle={styles.imageContainer}
            source={imageSource}
            resizeMode="contain"
          />
        </Lightbox>
      </ListItem>
    );
  });
};

const styles = StyleSheet.create({
  filesContainerStyle: {
    backgroundColor: colors.gray20,
    paddingHorizontal: normalize(12),
    paddingTop: 0
  },
  imageContainer: {
    alignSelf: 'center'
  },
  paddingBottom: {
    paddingBottom: normalize(12)
  }
});

const stylesWithProps = ({ isAnswer }: { isAnswer: boolean }) => {
  // width of an image minus paddings
  const maxWidth = imageWidth() - 2 * normalize(16) - (isAnswer ? 4 : 2) * normalize(12);

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
