import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { colors, normalize } from '../config';

/**
 * Smart icon component which can handle SVGs passed as `xml` prop or icon fonts, which are
 * rendered with a given `name` prop.
 *
 * @return {ReactElement} SvgXml or Ionicons, depending on having `xml` or `name`
 */
export const Icon = ({ xml, width, height, name, size, focused, iconColor, style, iconStyle }) => {
  const color = iconColor || (focused ? colors.accent : colors.primary);

  return (
    <View style={style} hitSlop={{ top: 12, bottom: 12 }}>
      {xml && <SvgXml xml={xml} width={width} height={height} style={iconStyle} />}
      {name && <Ionicons name={name} size={size} color={color} style={iconStyle} />}
    </View>
  );
};

// thx to: https://stackoverflow.com/a/49682510/9956365
const isRequired = (props, propName, componentName) => {
  // ensure, that one of 'xml' or 'name' is given
  if (!props.xml && !props.name) {
    return new Error(`One of 'xml' or 'name' is required by '${componentName}' component.`);
  }

  // ensure, that only one of 'xml' or 'name' is passed at a time
  if (props.xml && props.name) {
    return new Error(`Only one of 'xml' or 'name' is required by '${componentName}' component.`);
  }
};

Icon.propTypes = {
  xml: isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  name: isRequired,
  size: PropTypes.number,
  focused: PropTypes.bool,
  iconColor: PropTypes.string,
  style: PropTypes.object,
  iconStyle: PropTypes.object
};

Icon.defaultProps = {
  // width & height marks the size for svg
  width: normalize(24),
  height: normalize(24),
  // size is for font icon
  size: normalize(44),
  focused: false
};
