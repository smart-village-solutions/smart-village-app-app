import PropTypes from 'prop-types';
import React from 'react';

import { Image } from './Image';

export const Logo = (props) => {
  const {
    containerStyle,
    resizeMode = 'contain',
    source,
    style = { height: 80, width: 'auto' },
    ...rest
  } = props;

  return (
    <Image
      containerStyle={containerStyle}
      resizeMode={resizeMode}
      source={source}
      style={style}
      {...rest}
    />
  );
};

Logo.propTypes = {
  containerStyle: PropTypes.object,
  resizeMode: PropTypes.string,
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  style: PropTypes.object
};
