import PropTypes from 'prop-types';
import React, { createContext } from 'react';

export const GlobalSettingsContext = createContext({});

export const GlobalSettingsProvider = ({ globalSettings, children }) => (
  <GlobalSettingsContext.Provider value={{ ...globalSettings }}>
    {children}
  </GlobalSettingsContext.Provider>
);

GlobalSettingsProvider.propTypes = {
  globalSettings: PropTypes.object.isRequired,
  children: PropTypes.array.isRequired
};
