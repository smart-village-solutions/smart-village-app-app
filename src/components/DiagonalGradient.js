import PropTypes from 'prop-types';
import React from 'react';
import { LinearGradient } from 'expo';

import { colors } from '../config';

const defaultProps = {
  colors: [colors.primary, colors.secondary],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
  style: { flex: 1 }
};

export const DiagonalGradient = (props) =>
  props.children ? (
    <LinearGradient {...defaultProps} {...props}>
      {props.children}
    </LinearGradient>
  ) : (
    <LinearGradient {...defaultProps} {...props} />
  );

DiagonalGradient.propTypes = {
  children: PropTypes.object
};
