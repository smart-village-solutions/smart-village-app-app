import PropTypes from 'prop-types';
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

import { mergeRecoveredSettings } from './helpers/mergeRecoveredSettings';
import { storageHelper } from './helpers/storageHelper';

export const initialContext = {
  globalSettings: {
    filter: {},
    hdvt: {},
    navigation: 'tab',
    sections: {},
    settings: {},
    waste: {},
    whistleblow: {},
    widgets: []
  },
  listTypesSettings: {},
  locationSettings: {},
  conversationSettings: {}
};

export const SettingsContext = createContext(initialContext);

export const SettingsProvider = ({
  initialGlobalSettings,
  initialListTypesSettings,
  initialLocationSettings,
  initialConversationSettings,
  children
}) => {
  const [globalState, setGlobalState] = useState({
    settings: initialGlobalSettings,
    source: initialGlobalSettings
  });
  const persistedSource = useRef(initialGlobalSettings);
  const globalSettings = globalState.settings;
  const setGlobalSettings = useCallback((update) => {
    setGlobalState((current) => ({
      ...current,
      settings: typeof update === 'function' ? update(current.settings) : update
    }));
  }, []);
  if (globalState.source !== initialGlobalSettings) {
    setGlobalState({
      source: initialGlobalSettings,
      settings: mergeRecoveredSettings(globalState.source, globalSettings, initialGlobalSettings)
    });
  }
  useEffect(() => {
    if (persistedSource.current === globalState.source) return;
    persistedSource.current = globalState.source;
    void storageHelper
      .setGlobalSettings(globalSettings)
      .catch((error) => console.warn('Unable to persist recovered global settings', error));
  }, [globalSettings, globalState.source]);
  const [listTypesSettings, setListTypesSettings] = useState(initialListTypesSettings);
  const [locationState, setLocationState] = useState({
    settings: initialLocationSettings,
    source: initialLocationSettings,
    edited: []
  });
  const locationSettings = locationState.settings;
  const setLocationSettings = useCallback((update) => {
    setLocationState((current) => {
      const settings = typeof update === 'function' ? update(current.settings) : update;
      return {
        ...current,
        settings,
        // These are user choices, even when opting out matches the offline bootstrap default.
        edited: ['locationService', 'alternativePosition']
      };
    });
  }, []);
  if (locationState.source !== initialLocationSettings) {
    const settings = mergeRecoveredSettings(
      locationState.source,
      locationSettings,
      initialLocationSettings
    );
    const recovered = { ...settings };
    for (const key of locationState.edited) {
      if (Object.prototype.hasOwnProperty.call(locationSettings, key)) {
        recovered[key] = locationSettings[key];
      } else {
        delete recovered[key];
      }
    }
    setLocationState({ ...locationState, source: initialLocationSettings, settings: recovered });
  }
  const [conversationSettings, setConversationSettings] = useState(initialConversationSettings);

  return (
    <SettingsContext.Provider
      value={{
        globalSettings,
        setGlobalSettings,
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
