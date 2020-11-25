import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

export const GlobalSettingsContext = createContext({});

export const GlobalSettingsProvider = ({
  initialGlobalSettings,
  initialListTypesSettings,
  children
}) => {
  const [globalSettings, setGlobalSettings] = useState(initialGlobalSettings);
  const [listTypesSettings, setListTypesSettings] = useState(initialListTypesSettings);

  return (
    <GlobalSettingsContext.Provider
      value={{ globalSettings, setGlobalSettings, listTypesSettings, setListTypesSettings }}
    >
      {children}
    </GlobalSettingsContext.Provider>
  );
};

GlobalSettingsProvider.propTypes = {
  initialGlobalSettings: PropTypes.object.isRequired,
  initialListTypesSettings: PropTypes.object.isRequired,
  children: PropTypes.array.isRequired
};
