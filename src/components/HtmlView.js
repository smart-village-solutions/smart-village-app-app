import PropTypes from 'prop-types';
import React, { memo } from 'react';
import HTML from 'react-native-render-html';
import {
  alterNode,
  cssRulesFromSpecs,
  defaultTableStylesSpecs,
  IGNORED_TAGS,
  makeTableRenderer
} from '@native-html/table-plugin';
import { WebView } from 'react-native-webview';

import { colors, consts, normalize, styles } from '../config';
import { imageWidth, openLink } from '../helpers';

const cssRules =
  cssRulesFromSpecs({
    ...defaultTableStylesSpecs,
    linkColor: colors.primary,
    // TODO: font family documentation
    //      https://github.com/native-html/plugins/tree/rnrh/4.x#how-to-load-custom-fonts
    // fontFamily: 'regular',
    thColor: colors.lightestText,
    trOddBackground: colors.lightestText,
    trOddColor: colors.darkText,
    trEvenBackground: colors.lightestText,
    trEvenColor: colors.darkText,
    outerBorderWidthPx: 1,
    outerBorderColor: '#b5b5b5',
    columnsBorderWidthPx: 1
  }) +
  `
:root {
  font-size: ${normalize(13)}px;
}
`;

const renderers = {
  table: makeTableRenderer({ WebView, cssRules })
};

const htmlConfig = {
  alterNode,
  renderers,
  ignoredTags: IGNORED_TAGS
};

export const HtmlView = memo(({ html, tagsStyles, openWebScreen }) => {
  let width = imageWidth();

  if (width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH) {
    // image width should be only 70% on wider screens, as there are 15% padding on each side
    width = width * 0.7;
  }

  const maxWidth = width - 2 * normalize(14); // width of an image minus paddings

  return (
    <HTML
      html={html}
      {...htmlConfig}
      onLinkPress={(evt, href) => openLink(href, openWebScreen)}
      tagsStyles={{ ...styles.html, ...tagsStyles }}
      emSize={normalize(16)}
      baseFontStyle={styles.baseFontStyle}
      ignoredStyles={['width', 'height']}
      imagesMaxWidth={maxWidth}
      staticContentMaxWidth={maxWidth}
      alterChildren={(node) => {
        if (node.name === 'img' || node.name === 'iframe') {
          delete node.attribs.width;
          delete node.attribs.height;
        }

        return node.children;
      }}
    />
  );
});

HtmlView.displayName = 'HtmlView';

HtmlView.propTypes = {
  html: PropTypes.string,
  tagsStyles: PropTypes.object,
  openWebScreen: PropTypes.func
};

HtmlView.defaultProps = {
  tagsStyles: {}
};
