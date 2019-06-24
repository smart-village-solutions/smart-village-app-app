import PropTypes from 'prop-types';
import React from 'react';
import HTML from 'react-native-render-html';
import { IGNORED_TAGS, alterNode, makeTableRenderer } from 'react-native-render-html-table-bridge';
import { WebView } from 'react-native-webview';

import { device, normalize, styles } from '../config';
import { openLink } from '../helpers';

const renderers = {
  table: makeTableRenderer({
    WebViewComponent: WebView
  })
};

const htmlConfig = {
  alterNode,
  renderers,
  ignoredTags: IGNORED_TAGS
};

export const HtmlView = (props) => (
  <HTML
    {...props}
    {...htmlConfig}
    tagsStyles={{ ...styles.html, ...props.tagsStyles }}
    emSize={normalize(16)}
    baseFontStyle={styles.baseFontStyle}
    imagesMaxWidth={device.width}
    staticContentMaxWidth={device.width}
    onLinkPress={(evt, href) => openLink(href)}
  />
);

HtmlView.propTypes = {
  tagsStyles: PropTypes.object
};

HtmlView.defaultProps = {
  tagsStyles: {}
};
