import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

import { Wrapper } from '../../Wrapper';

export const ConsulVideoComponent = ({ videoUrl }) => {
  const SplitedVideo = videoUrl.split('watch?v=');
  const Embed = SplitedVideo.join('embed/');

  return (
    <Wrapper>
      <WebView
        bounces={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        source={{
          uri: Embed
        }}
        style={styles.videoView}
      />
    </Wrapper>
  );
};

ConsulVideoComponent.propTypes = {
  videoUrl: PropTypes.string
};

const styles = StyleSheet.create({
  videoView: {
    flex: 1,
    width: '100%',
    height: 250
  }
});
