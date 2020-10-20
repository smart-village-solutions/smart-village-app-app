import PropTypes from 'prop-types';
import React, { createContext } from 'react';

export const MatomoContext = createContext({});

export const MatomoProvider = ({ instance, children }) => (
  <MatomoContext.Provider value={instance}>{children}</MatomoContext.Provider>
);

MatomoProvider.propTypes = {
  instance: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired
};
