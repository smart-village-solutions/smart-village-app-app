import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

import { consts } from './config';

export const SettingsContext = createContext({
  globalSettings: {
    filter: {},
    navigation: consts.DRAWER,
    sections: {}
  }
});

export const SettingsProvider = ({ initialGlobalSettings, initialListTypesSettings, children }) => {
  const [globalSettings, setGlobalSettings] = useState(initialGlobalSettings);
  const [listTypesSettings, setListTypesSettings] = useState(initialListTypesSettings);

  return (
    <SettingsContext.Provider
      value={{
        globalSettings,
        setGlobalSettings,
        listTypesSettings,
        setListTypesSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  initialGlobalSettings: PropTypes.object.isRequired,
  initialListTypesSettings: PropTypes.object.isRequired,
  children: PropTypes.array.isRequired
};
