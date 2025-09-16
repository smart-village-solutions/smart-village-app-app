import _filter from 'lodash/filter';
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { Image } from './Image';
import { ImagesCarousel } from './ImagesCarousel';

export const ImageSection = ({ isNews, mediaContents }) => {
  const images = [];

  !!mediaContents?.length &&
    _filter(
      mediaContents,
      (mediaContent) =>
        mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
    ).forEach((item) => {
      !!item.sourceUrl?.url &&
        images.push({
          picture: {
            uri: item.sourceUrl.url,
            copyright: item.copyright,
            captionText: item.captionText
          }
        });
    });

  if (!images.length) {
    return null;
  }

  return (
    <>
      {images.length > 1 && <ImagesCarousel data={images} />}

      {images.length === 1 && (
        <Image source={images[0].picture} containerStyle={styles.imageContainer} isNews={isNews} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignSelf: 'center'
  }
});

ImageSection.propTypes = {
  isNews: PropTypes.bool,
  mediaContents: PropTypes.array
};
