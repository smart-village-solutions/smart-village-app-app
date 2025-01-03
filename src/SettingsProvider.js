import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

export const SettingsContext = createContext({
  globalSettings: {
    deprecated: {},
    filter: {},
    hdvt: {},
    navigation: 'tab',
    sections: {},
    settings: {},
    widgets: []
  },
  listTypesSettings: {},
  locationSettings: {},
  conversationSettings: {}
});

export const SettingsProvider = ({
  initialGlobalSettings,
  initialListTypesSettings,
  initialLocationSettings,
  initialConversationSettings,
  children
}) => {
  const [globalSettings] = useState(initialGlobalSettings);
  const [listTypesSettings, setListTypesSettings] = useState(initialListTypesSettings);
  const [locationSettings, setLocationSettings] = useState(initialLocationSettings);
  const [conversationSettings, setConversationSettings] = useState(initialConversationSettings);

  return (
    <SettingsContext.Provider
      value={{
        globalSettings,
        listTypesSettings,
        setListTypesSettings,
        locationSettings,
        setLocationSettings,
        conversationSettings,
        setConversationSettings
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
  initialConversationSettings: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
};
