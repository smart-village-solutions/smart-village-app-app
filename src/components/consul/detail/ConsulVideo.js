import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

import { Wrapper } from '../../Wrapper';

export const ConsulVideo = ({ videoUrl }) => {
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

const styles = StyleSheet.create({
  videoView: {
    flex: 1,
    height: 250,
    width: '100%'
  }
});

ConsulVideo.propTypes = {
  videoUrl: PropTypes.string
};
