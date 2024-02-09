import PropTypes from 'prop-types';
import React from 'react';

import { Image } from './Image';

export const Logo = (props) => <Image {...props} />;

Logo.propTypes = {
  containerStyle: PropTypes.object,
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  childrenContainerStyle: PropTypes.object,
  resizeMode: PropTypes.string
};

Logo.defaultProps = {
  childrenContainerStyle: {
    height: 80,
    width: 'auto'
  },
  resizeMode: 'contain'
};
