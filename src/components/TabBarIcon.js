import PropTypes from 'prop-types';
import React, { memo, useContext } from 'react';
import { StyleSheet } from 'react-native';

import { consts, device, normalize } from '../config';
import { OrientationContext } from '../OrientationProvider';

import { Icon } from './Icon';

/**
 * Smart icon component for the tab bar, which adds logics to styling based on orientation and
 * platform. It is a wrapper and renders the main `Icon` component.
 *
 * @return {ReactElement} Icon - main `Icon` component
 */
export const TabBarIcon = memo(
  ({ xml, width, height, name, size, focused, style, landscapeStyle }) => {
    const { orientation, dimensions } = useContext(OrientationContext);
    let iconStyle;

    const needLandscapeStyle =
      orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;

    // we need adjustments only on iOS, because Android
    if (needLandscapeStyle && device.platform == 'ios') {
      style = {
        ...style,
        ...landscapeStyle
      };

      // need to decrease the icon size on iOS for landscape, because the whole tab bar shrinks in
      // height for landscape
      width = width * 0.75;
      height = height * 0.75;
      size = size * 0.75;

      // need to increase the space between icon and text on iOS landscape
      iconStyle = { width, ...styles.marginIcon };
    }

    return <Icon {...{ xml, width, height, name, size, focused, style, iconStyle }} />;
  }
);

const styles = StyleSheet.create({
  marginIcon: {
    marginRight: normalize(10)
  }
});

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

TabBarIcon.displayName = 'TabBarIcon';

TabBarIcon.propTypes = {
  xml: isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  name: isRequired,
  size: PropTypes.number,
  focused: PropTypes.bool,
  style: PropTypes.object,
  landscapeStyle: PropTypes.object
};

TabBarIcon.defaultProps = {
  // width & height marks the size for svg
  width: normalize(24),
  height: normalize(24),
  // size is for font icon
  size: normalize(26),
  focused: false
};
