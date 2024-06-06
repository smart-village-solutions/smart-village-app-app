import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

export const SettingsContext = createContext({
  globalSettings: {
    filter: {},
    hdvt: {},
    navigation: 'tab',
    sections: {},
    settings: {},
    widgets: []
  },
  listTypesSettings: {},
  locationSettings: {}
});

export const SettingsProvider = ({
  initialGlobalSettings,
  initialListTypesSettings,
  initialLocationSettings,
  children
}) => {
  const [globalSettings] = useState(initialGlobalSettings);
  const [listTypesSettings, setListTypesSettings] = useState(initialListTypesSettings);
  const [locationSettings, setLocationSettings] = useState(initialLocationSettings);

  return (
    <SettingsContext.Provider
      value={{
        globalSettings,
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
