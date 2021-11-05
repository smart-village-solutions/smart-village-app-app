import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

export const SettingsContext = createContext({
  globalSettings: {
    filter: {},
    sections: {}
  },
  onboardingSettings: {
    onboardingComplete: true
  }
});

export const SettingsProvider = ({
  initialGlobalSettings,
  initialListTypesSettings,
  initialLocationSettings,
  initialOnboardingSettings,
  children
}) => {
  const [globalSettings, setGlobalSettings] = useState(initialGlobalSettings);
  const [listTypesSettings, setListTypesSettings] = useState(initialListTypesSettings);
  const [locationSettings, setLocationSettings] = useState(initialLocationSettings);
  const [onboardingSettings, setOnboardingSettings] = useState(initialOnboardingSettings);

  return (
    <SettingsContext.Provider
      value={{
        globalSettings,
        setGlobalSettings,
        listTypesSettings,
        setListTypesSettings,
        locationSettings,
        setLocationSettings,
        onboardingSettings,
        setOnboardingSettings
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
  initialOnboardingSettings: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
};
