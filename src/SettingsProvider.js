import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

export const SettingsContext = createContext({
  globalSettings: {
    filter: {},
    hdvt: {},
    navigation: {},
    sections: {},
    settings: {},
    widgets: []
  }
});

export const SettingsProvider = ({
  initialGlobalSettings,
  initialListTypesSettings,
  initialLocationSettings,
  children
}) => {
  const [globalSettings, setGlobalSettings] = useState(initialGlobalSettings);
  const [listTypesSettings, setListTypesSettings] = useState(initialListTypesSettings);
  const [locationSettings, setLocationSettings] = useState(initialLocationSettings);

  return (
    <SettingsContext.Provider
      value={{
        globalSettings,
        setGlobalSettings,
        listTypesSettings,
        setListTypesSettings,
        locationSettings,
        setLocationSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  initialGlobalSettings: PropTypes.object.isRequired,
  initialListTypesSettings: PropTypes.object.isRequired,
  initialLocationSettings: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
};
