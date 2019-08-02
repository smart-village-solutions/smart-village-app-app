import PropTypes from 'prop-types';
import React from 'react';
import HTML from 'react-native-render-html';
import {
  IGNORED_TAGS,
  alterNode,
  makeTableRenderer,
  defaultTableStylesSpecs,
  cssRulesFromSpecs
} from 'react-native-render-html-table-bridge';
import { WebView } from 'react-native-webview';

import { colors, normalize, styles } from '../config';
import { openLink, imageWidth } from '../helpers';

const tableCssRules =
  cssRulesFromSpecs({
    ...defaultTableStylesSpecs,
    linkColor: colors.primary,
    // TODO: font family was not working at the moment with following implementation
    //       https://github.com/jsamr/react-native-render-html-table-bridge/blob/master/readme.md#how-to-load-custom-fonts
    // fontFamily: 'titillium-web-regular',
    thColor: colors.lightestText,
    trOddBackground: colors.lightestText,
    trOddColor: colors.darkText,
    trEvenBackground: colors.lightestText,
    trEvenColor: colors.darkText
  }) +
  `
:root {
  font-size: ${normalize(13)}px;
}
th {
  border-left: 0.25px solid ${'#3f5c7a'};
  border-top: 0.25px solid ${'#3f5c7a'};
}
td {
  border-left: 0.25px solid ${'#b5b5b5'};
  border-top: 0.25px solid ${'#b5b5b5'};
}
`;

const renderers = {
  table: makeTableRenderer({
    WebViewComponent: WebView,
    cssRules: tableCssRules
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
    onLinkPress={(evt, href) => openLink(href)}
    tagsStyles={{ ...styles.html, ...props.tagsStyles }}
    emSize={normalize(16)}
    baseFontStyle={styles.baseFontStyle}
    ignoredStyles={['width', 'height']}
    imagesMaxWidth={imageWidth() - 2 * normalize(14)}
    staticContentMaxWidth={imageWidth() - 2 * normalize(14)}
    alterChildren={(node) => {
      if (node.name === 'img' || node.name === 'iframe') {
        delete node.attribs.width;
        delete node.attribs.height;
      }

      return node.children;
    }}
  />
);

HtmlView.propTypes = {
  tagsStyles: PropTypes.object
};

HtmlView.defaultProps = {
  tagsStyles: {}
};
