import PropTypes from 'prop-types';
import React from 'react';
import { LinearGradient } from 'expo';

import { colors } from '../config';

export const DiagonalGradient = ({ children }) => (
  <LinearGradient
    colors={[colors.primary, colors.secondary]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    {children}
  </LinearGradient>
);

DiagonalGradient.propTypes = {
  children: PropTypes.object.isRequired
};
