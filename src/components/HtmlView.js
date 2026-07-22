import IframeRenderer, { iframeModel } from '@native-html/iframe-plugin';
import TableRenderer, {
  cssRulesFromSpecs,
  defaultTableStylesSpecs,
  tableModel
} from '@native-html/table-plugin';
import { removeElement, textContent } from 'domutils';
import PropTypes from 'prop-types';
import React, { memo, useContext, useMemo } from 'react';
import HTML, {
  defaultHTMLElementModels,
  IMGElement,
  useIMGElementProps
} from 'react-native-render-html';
import { WebView } from 'react-native-webview';

import { AccessibilityContext } from '../AccessibilityProvider';
import { consts, normalize, styles } from '../config';
import { imageWidth, openLink } from '../helpers';
import { useTheme } from '../hooks/useTheme';

import { RegularText } from './Text';

const { HTML_REGEX } = consts;

const scaleTypographyStyle = (style, textScaleMultiplier = 1) => {
  if (!style || textScaleMultiplier === 1 || Array.isArray(style)) return style;

  const scaledStyle = { ...style };
  if (typeof style.fontSize === 'number') {
    scaledStyle.fontSize = style.fontSize * textScaleMultiplier;
  }
  if (typeof style.lineHeight === 'number') {
    scaledStyle.lineHeight = style.lineHeight * textScaleMultiplier;
  }

  return scaledStyle;
};

const scaleTagsStyles = (tagsStyles = {}, textScaleMultiplier = 1) =>
  Object.entries(tagsStyles).reduce((acc, [tagName, style]) => {
    acc[tagName] = scaleTypographyStyle(style, textScaleMultiplier);
    return acc;
  }, {});

const getCssRules = (colors, textScaleMultiplier = 1) =>
  cssRulesFromSpecs({
    ...defaultTableStylesSpecs,
    linkColor: colors.primary,
    // TODO: font family documentation
    //      https://github.com/native-html/plugins/tree/rnrh/4.x#how-to-load-custom-fonts
    // fontFamily: 'regular',
    thColor: colors.onPrimary,
    trOddBackground: colors.surface,
    trOddColor: colors.text,
    trEvenBackground: colors.surfaceElevated,
    trEvenColor: colors.text
  }) +
  `
:root {
  font-size: ${normalize(13) * textScaleMultiplier}px;
}
th {
  border-bottom: 1px solid ${colors.border};
  border-left: 1px solid ${colors.border};
  border-top: 1px solid ${colors.border};
}
th:last-child {
  border-right: 1px solid ${colors.border};
}
td {
  border-bottom: 1px solid ${colors.border};
  border-left: 1px solid ${colors.border};
  border-top: 0;
}
td:last-child {
  border-right: 1px solid ${colors.border};
}
tr:first-child td {
  border-top: 1px solid ${colors.border};
}
table {
  border-bottom: 1px solid ${colors.border};
}
`;

const getThemedHtmlStyles = (colors) => ({
  ...styles.html,
  a: { ...styles.html.a, color: colors.primary },
  h1: { ...styles.html.h1, color: colors.text },
  h2: { ...styles.html.h2, color: colors.text },
  h3: { ...styles.html.h3, color: colors.text },
  h4: { ...styles.html.h4, color: colors.text },
  h5: { ...styles.html.h5, color: colors.text },
  h6: { ...styles.html.h6, color: colors.text },
  p: { ...styles.html.p, color: colors.text }
});

const HtmlImageRenderer = (props) => {
  const imgProps = useIMGElementProps(props);
  const altText = imgProps.alt?.trim?.();
  const accessibilityLabel = altText || consts.a11yLabel.image;

  return (
    <IMGElement
      {...imgProps}
      containerProps={{
        ...imgProps.containerProps,
        accessible: true,
        accessibilityRole: 'image',
        accessibilityLabel
      }}
    />
  );
};

const hasMeaningfulNonTextNode = (node) => {
  if (!node?.children?.length) {
    return false;
  }

  return node.children.some((child) => {
    if (child.type === 'text') {
      return false;
    }

    if (child.name === 'br') {
      return false;
    }

    if (child.children?.length) {
      return true;
    }

    return true;
  });
};

const isAccessibilityEmptyParagraph = (domNode) => {
  if (!domNode) {
    return false;
  }

  const normalizedTextContent = textContent(domNode)
    .replace(/\u00A0/g, ' ')
    .trim();

  return normalizedTextContent.length === 0 && !hasMeaningfulNonTextNode(domNode);
};

const isWhitespaceOnlyTextNodeInList = (node) =>
  node?.type === 'text' &&
  node.data?.trim?.().length === 0 &&
  (node.parent?.name === 'ul' || node.parent?.name === 'ol');

const BLOCK_ELEMENT_NAMES = new Set(['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'p']);

const FORMATTING_KEY_BY_TAG = {
  b: 'bold',
  del: 'lineThrough',
  em: 'italic',
  i: 'italic',
  s: 'lineThrough',
  strike: 'lineThrough',
  strong: 'bold',
  u: 'underline'
};

const FORMATTING_KEY_BY_STYLE = [
  ['bold', /font-weight\s*:\s*(bold|[6-9]00)/],
  ['italic', /font-style\s*:\s*italic/],
  ['underline', /text-decoration[^:]*:\s*[^;]*underline/],
  ['lineThrough', /text-decoration[^:]*:\s*[^;]*line-through/],
  ['color', /(?:^|;)\s*color\s*:\s*[^;]+/]
];

const getFormattingLabels = (node) => {
  const tagName = node?.name?.toLowerCase?.();
  const inlineStyle = node?.attribs?.style?.toLowerCase?.() || '';
  const { formatting } = consts.a11yLabel;
  const formattingKeys = new Set();
  const tagFormattingKey = FORMATTING_KEY_BY_TAG[tagName];

  if (tagFormattingKey) {
    formattingKeys.add(tagFormattingKey);
  }

  if (node?.attribs?.color) {
    formattingKeys.add('color');
  }

  FORMATTING_KEY_BY_STYLE.forEach(([formattingKey, pattern]) => {
    if (pattern.test(inlineStyle)) formattingKeys.add(formattingKey);
  });

  return Array.from(formattingKeys, (formattingKey) => formatting[formattingKey]);
};

const hasInlineFormatting = (node) =>
  node?.children?.some((child) => {
    if (child.type === 'text') return false;
    if (BLOCK_ELEMENT_NAMES.has(child.name)) return false;

    return getFormattingLabels(child).length > 0 || hasInlineFormatting(child);
  }) || false;

const getFormattedAccessibilityText = (node, isRoot = true) => {
  if (!node) return '';
  if (node.type === 'text') return node.data || '';

  if (!isRoot && BLOCK_ELEMENT_NAMES.has(node.name)) {
    return textContent(node);
  }

  const childText = (node.children || [])
    .map((child) => getFormattedAccessibilityText(child, false))
    .join('');

  return getFormattingLabels(node).reduce(
    (formattedText, label) => `${label} Anfang, ${formattedText.trim()}, ${label} Ende`,
    childText
  );
};

const getFormattingAccessibilityProps = (domNode) => {
  if (!hasInlineFormatting(domNode)) return {};

  return {
    accessible: true,
    accessibilityLabel: getFormattedAccessibilityText(domNode).replace(/\s+/g, ' ').trim()
  };
};

const renderers = {
  img: HtmlImageRenderer,
  iframe: IframeRenderer,
  table: TableRenderer
};

const mergeNativeProps = (baseNativeProps, additionalNativeProps) => ({
  ...(baseNativeProps || {}),
  ...(additionalNativeProps || {})
});

const getListNativeProps =
  (role, model, accessible = true) =>
  (tnode, preGeneratedProps = {}) => {
    const modelProps = model.getReactNativeProps?.(tnode, preGeneratedProps) ?? {};

    return {
      ...modelProps,
      native: mergeNativeProps(modelProps?.native ?? preGeneratedProps?.native, {
        accessible,
        accessibilityRole: role,
        ...getFormattingAccessibilityProps(tnode.domNode)
      })
    };
  };

const getBlockNativeProps =
  (model) =>
  (tnode, preGeneratedProps = {}) => {
    const modelProps = model.getReactNativeProps?.(tnode, preGeneratedProps) ?? {};
    const formattingProps = getFormattingAccessibilityProps(tnode.domNode);

    if (!formattingProps.accessible) return modelProps;

    return {
      ...modelProps,
      native: mergeNativeProps(modelProps?.native ?? preGeneratedProps?.native, formattingProps)
    };
  };

const htmlElementModels = {
  div: defaultHTMLElementModels.div.extend((model) => ({
    getReactNativeProps: getBlockNativeProps(model)
  })),
  p: defaultHTMLElementModels.p.extend((model) => ({
    getReactNativeProps(tnode, preGeneratedProps = {}) {
      const modelProps = model.getReactNativeProps?.(tnode, preGeneratedProps) ?? {};

      if (!isAccessibilityEmptyParagraph(tnode.domNode)) {
        const formattingProps = getFormattingAccessibilityProps(tnode.domNode);

        if (!formattingProps.accessible) return modelProps;

        return {
          ...modelProps,
          native: mergeNativeProps(modelProps?.native ?? preGeneratedProps?.native, formattingProps)
        };
      }

      return {
        ...modelProps,
        native: mergeNativeProps(modelProps?.native ?? preGeneratedProps?.native, {
          accessible: false,
          accessibilityElementsHidden: true,
          importantForAccessibility: 'no-hide-descendants'
        })
      };
    }
  })),
  ul: defaultHTMLElementModels.ul.extend((model) => ({
    getReactNativeProps: getListNativeProps('list', model, false)
  })),
  ol: defaultHTMLElementModels.ol.extend((model) => ({
    getReactNativeProps: getListNativeProps('list', model, false)
  })),
  li: defaultHTMLElementModels.li.extend((model) => ({
    getReactNativeProps: getListNativeProps('listitem', model)
  }))
};

const htmlConfig = {
  WebView,
  renderers,
  customHTMLElementModels: {
    ...htmlElementModels,
    iframe: iframeModel,
    table: tableModel
  }
};

const isYouTubeUri = (uri) => {
  if (!uri) {
    return false;
  }
  try {
    const { hostname } = new URL(uri);
    const normalizedHostname = hostname.toLowerCase();
    return (
      normalizedHostname === 'youtu.be' ||
      normalizedHostname === 'youtube.com' ||
      normalizedHostname.endsWith('.youtube.com')
    );
  } catch {
    // Invalid URLs must not break HTML rendering.
    return false;
  }
};

// YouTube embeds require a Referer header, otherwise YouTube returns error 153
// ("The request contains no HTTP Referer or equivalent client identity").
// provideEmbeddedHeaders is called by @native-html/iframe-plugin for each iframe src
// and the returned headers are passed to the underlying WebView source.
// Note: using 'https://www.youtube.com' as Referer causes error 152-4 because YouTube
// applies stricter embed rules when the Referer matches its own domain. Using the
// app's own domain 'https://smart-village.app' satisfies the presence check without
// triggering those domain-specific restrictions.
const provideEmbeddedHeaders = (uri) => {
  if (isYouTubeUri(uri)) {
    return { Referer: 'https://smart-village.app' };
  }

  return undefined;
};

export const HtmlView = memo(
  ({
    big = true,
    html,
    isImageFullWidth = false,
    openWebScreen,
    selectable = false,
    tagsStyles = {},
    width
  }) => {
    const { colors } = useTheme();
    const { isBoldTextEnabled, textScaleMultiplier = 1 } = useContext(AccessibilityContext);
    const themedHtmlStyles = useMemo(() => getThemedHtmlStyles(colors), [colors]);
    const scaledBaseStyle = useMemo(
      () =>
        scaleTypographyStyle({ ...styles.baseFontStyle, color: colors.text }, textScaleMultiplier),
      [colors.text, textScaleMultiplier]
    );
    const scaledTagStyles = useMemo(
      () =>
        scaleTagsStyles(
          {
            ...themedHtmlStyles,
            ...(isBoldTextEnabled ? styles.htmlBoldTextEnabled : {}),
            ...tagsStyles
          },
          textScaleMultiplier
        ),
      [isBoldTextEnabled, tagsStyles, textScaleMultiplier, themedHtmlStyles]
    );
    const defaultTextProps = useMemo(() => ({ allowFontScaling: true, selectable }), [selectable]);

    let calculatedWidth =
      width !== undefined
        ? Math.min(imageWidth(isImageFullWidth), width)
        : imageWidth(isImageFullWidth);

    if (!isImageFullWidth && calculatedWidth > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH) {
      // image width should be only 70% on wider screens, as there are 15% padding on each side
      calculatedWidth = calculatedWidth * 0.7;
    }

    const maxWidth = calculatedWidth - 2 * normalize(14); // width of an image minus paddings

    if (!html?.match(HTML_REGEX)) {
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
        provideEmbeddedHeaders={provideEmbeddedHeaders}
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
          table: { cssRules: getCssRules(colors, textScaleMultiplier) }
        }}
        tagsStyles={scaledTagStyles}
        emSize={normalize(16) * textScaleMultiplier}
        baseStyle={scaledBaseStyle}
        ignoredStyles={['width', 'height']}
        contentWidth={maxWidth}
        domVisitors={{
          onElement: (node) => {
            if (node.name === 'img' || node.name === 'iframe') {
              delete node.attribs.width;
              delete node.attribs.height;
            }

            return node.children;
          },
          onText: (node) => {
            if (isWhitespaceOnlyTextNodeInList(node)) {
              removeElement(node);
            }
          }
        }}
        systemFonts={['regular', 'bold', 'condbold', 'italic', 'bold-italic', 'condbold-italic']}
        defaultTextProps={defaultTextProps}
      />
    );
  }
);

HtmlView.displayName = 'HtmlView';

HtmlView.propTypes = {
  big: PropTypes.bool,
  html: PropTypes.string,
  isImageFullWidth: PropTypes.bool,
  openWebScreen: PropTypes.func,
  selectable: PropTypes.bool,
  tagsStyles: PropTypes.object,
  width: PropTypes.number
};
