import IframeRenderer, { iframeModel } from '@native-html/iframe-plugin';
import TableRenderer, {
  cssRulesFromSpecs,
  defaultTableStylesSpecs,
  tableModel
} from '@native-html/table-plugin';
import PropTypes from 'prop-types';
import React, { memo, useContext } from 'react';
import HTML from 'react-native-render-html';
import { WebView } from 'react-native-webview';

import { AccessibilityContext } from '../AccessibilityProvider';
import { colors, consts, normalize, styles } from '../config';
import { imageWidth, openLink } from '../helpers';

import { RegularText } from './Text';

const { HTML_REGEX } = consts;

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
    trEvenColor: colors.darkText
  }) +
  `
:root {
  font-size: ${normalize(13)}px;
}
th {
  border-bottom: 1px solid ${'#3f5c7a'};
  border-left: 1px solid ${'#3f5c7a'};
  border-top: 1px solid ${'#3f5c7a'};
}
th:last-child {
  border-right: 1px solid ${'#3f5c7a'};
}
td {
  border-bottom: 1px solid ${'#b5b5b5'};
  border-left: 1px solid ${'#b5b5b5'};
  border-top: 0;
}
td:last-child {
  border-right: 1px solid ${'#b5b5b5'};
}
table {
  border-bottom: 1px solid ${'#b5b5b5'};
}
`;

const renderers = {
  iframe: IframeRenderer,
  table: TableRenderer
};

const htmlConfig = {
  WebView,
  renderers,
  customHTMLElementModels: {
    iframe: iframeModel,
    table: tableModel
  }
};

export const HtmlView = memo(
  ({ big = true, html, openWebScreen, selectable = false, tagsStyles = {}, width }) => {
    const { isBoldTextEnabled } = useContext(AccessibilityContext);

    let calculatedWidth = width !== undefined ? Math.min(imageWidth(), width) : imageWidth();

    if (calculatedWidth > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH) {
      // image width should be only 70% on wider screens, as there are 15% padding on each side
      calculatedWidth = calculatedWidth * 0.7;
    }

    const maxWidth = calculatedWidth - 2 * normalize(14); // width of an image minus paddings

    if (!html.match(HTML_REGEX)) {
      return (
        <RegularText big={big} selectable={selectable}>
          {html}
        </RegularText>
      );
    }

    return (
      <HTML
        source={{ html }}
        {...htmlConfig}
        renderersProps={{
          a: { onPress: (evt, href) => openLink(href, openWebScreen) },
          iframe: {
            scalesPageToFit: true,
            webViewProps: {
              // the opacity of the iframe was set to 0.99 to solve the crashing problem on Android
              // thanks to : https://github.com/meliorence/react-native-render-html/issues/393#issuecomment-1277533605
              style: { opacity: 0.99 }
            }
          },
          table: { cssRules }
        }}
        tagsStyles={{
          ...styles.html,
          ...(isBoldTextEnabled ? styles.htmlBoldTextEnabled : {}),
          ...tagsStyles
        }}
        emSize={normalize(16)}
        baseStyle={styles.baseFontStyle}
        ignoredStyles={['width', 'height']}
        contentWidth={maxWidth}
        domVisitors={{
          onElement: (node) => {
            if (node.name === 'img' || node.name === 'iframe') {
              delete node.attribs.width;
              delete node.attribs.height;
            }

            return node.children;
          }
        }}
        systemFonts={['regular', 'bold', 'condbold', 'italic', 'bold-italic', 'condbold-italic']}
        defaultTextProps={{ selectable }}
      />
    );
  }
);

HtmlView.displayName = 'HtmlView';

HtmlView.propTypes = {
  big: PropTypes.bool,
  html: PropTypes.string,
  openWebScreen: PropTypes.func,
  selectable: PropTypes.bool,
  tagsStyles: PropTypes.object,
  width: PropTypes.number
};
