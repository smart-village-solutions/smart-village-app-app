import PropTypes from 'prop-types';
import React from 'react';

import { Image } from './Image';

export const Logo = (props) => <Image {...props} />;

Logo.propTypes = {
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  style: PropTypes.object
};

Logo.defaultProps = {
  style: {
    height: 80,
    resizeMode: 'contain',
    width: 'auto'
  }
};
