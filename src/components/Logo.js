import PropTypes from 'prop-types';
import React from 'react';

import { Image } from './Image';

export const Logo = (props) => {
  const {
    containerStyle,
    source,
    childrenContainerStyle = { height: 80, width: 'auto' },
    resizeMode = 'contain',
    ...rest
  } = props;

  return (
    <Image
      containerStyle={containerStyle}
      source={source}
      childrenContainerStyle={childrenContainerStyle}
      resizeMode={resizeMode}
      {...rest}
    />
  );
};

Logo.propTypes = {
  containerStyle: PropTypes.object,
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  childrenContainerStyle: PropTypes.object,
  resizeMode: PropTypes.string
};
