import _filter from 'lodash/filter';
import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

import { colors, normalize } from '../config';
import { trimNewLines } from '../helpers';

import { LoadingContainer } from './LoadingContainer';
import { WrapperHorizontal } from './Wrapper';

// necessary hacky way of implementing iframe in webview with correct zoom level
// thx to: https://stackoverflow.com/a/55780430
const INJECTED_JAVASCRIPT_FOR_IFRAME_WEBVIEW = `
  const meta = document.createElement('meta');
  meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=0.99, user-scalable=0');
  meta.setAttribute('name', 'viewport');
  document.getElementsByTagName('head')[0].appendChild(meta);
  true;
`;

export const MediaSection = ({ mediaContents }) => {
  const filteredContents = _filter(
    mediaContents,
    (mediaContent) =>
      (mediaContent.contentType === 'video' || mediaContent.contentType === 'audio') &&
      !!mediaContent?.sourceUrl?.url
  );

  if (!filteredContents?.length) {
    return null;
  }

  return (
    <WrapperHorizontal>
      {filteredContents.map((mediaContent) => (
        <WebView
          key={`mediaContent${mediaContent.id}`}
          source={{ html: trimNewLines(mediaContent.sourceUrl.url) }}
          style={styles.iframeWebView}
          scrollEnabled={false}
          bounces={false}
          injectedJavaScript={INJECTED_JAVASCRIPT_FOR_IFRAME_WEBVIEW}
          startInLoadingState
          renderLoading={() => (
            <LoadingContainer web>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          )}
        />
      ))}
    </WrapperHorizontal>
  );
};

const styles = StyleSheet.create({
  iframeWebView: {
    height: normalize(210),
    width: '100%'
  }
});

MediaSection.propTypes = {
  mediaContents: PropTypes.array
};
