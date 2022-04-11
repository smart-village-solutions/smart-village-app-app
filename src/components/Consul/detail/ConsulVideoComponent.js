import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

export const ConsulVideoComponent = ({ videoUrl }) => {
  const SplitedVideo = videoUrl.split('watch?v=');
  const Embed = SplitedVideo.join('embed/');

  return (
    <View style={styles.container}>
      <WebView
        bounces={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        source={{
          uri: Embed
        }}
        style={styles.videoView}
      />
    </View>
  );
};

ConsulVideoComponent.propTypes = {
  videoUrl: PropTypes.string
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  videoView: {
    width: 320,
    height: 230
  }
});
