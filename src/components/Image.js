import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { CacheManager } from 'react-native-expo-image-cache';
import { Image as RNEImage } from 'react-native-elements';

import { colors, device } from '../config';

const imageWidth = device.width;
// image aspect ratio is 360x180, so for accurate ratio in our view we need to calculate
// a factor with our current device with for the image, to set a correct height
const factor = imageWidth / 360;
const imageHeight = 180 * factor;

export const Image = ({ source, style, PlaceholderContent }) => {
  const [uri, setUri] = useState(null);

  // if there is a source.uri to fetch, do it with the CacheManager and set the local path to show.
  // if there is no uri, the source itself should be already a local path, so set it immediately.
  useEffect(() => {
    // to fix the warning:
    // "Can't perform a React state update on an unmounted component.
    //  This is a no-op, but it indicates a memory leak in your application.
    //  To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function."
    // -> https://juliangaramendy.dev/use-promise-subscription/
    let mounted = true;

    source.uri
      ? CacheManager.get(source.uri)
        .getPath()
        .then((path) => mounted && setUri(path))
      : mounted && setUri(source);

    return () => (mounted = false);
  }, []);

  return (
    <RNEImage
      source={source.uri ? { uri } : uri}
      style={style}
      PlaceholderContent={PlaceholderContent}
      placeholderStyle={{ backgroundColor: colors.transparent }}
    />
  );
};

Image.propTypes = {
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  style: PropTypes.object,
  PlaceholderContent: PropTypes.object
};

Image.defaultProps = {
  style: {
    alignSelf: 'center',
    height: imageHeight,
    width: imageWidth
  },
  PlaceholderContent: <ActivityIndicator />
};
