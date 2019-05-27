import PropTypes from 'prop-types';
import React from 'react';
import HTML from 'react-native-render-html';

import { colors, device, normalize, styles } from '../config';
import { openLink } from '../helpers';

export const HtmlView = (props) => (
  <HTML
    {...props}
    tagsStyles={{ ...styles.html, ...props.tagsStyles }}
    emSize={normalize(16)}
    baseFontStyle={{ color: colors.darkText, fontSize: normalize(16) }}
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
