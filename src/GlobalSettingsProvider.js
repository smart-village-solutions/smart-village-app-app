import React, { createContext, useContext, useReducer } from 'react';

import { storageHelper } from './helpers/storageHelper';

const GlobalSettingsContext = createContext();

const globalSettingsReducer = (globalSettings, action) => {
  switch (action.type) {
    case 'setGlobalSettings': {
      // save to async storage
      storageHelper.setGlobalSettings(action.payload);

      return {
        ...globalSettings,
        ...action.payload
      };
    }
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export const GlobalSettingsProvider = ({ initialState, children }) => {
  const [globalSettings, dispatch] = useReducer(globalSettingsReducer, initialState);

  return (
    <GlobalSettingsContext.Provider value={{ globalSettings, dispatch }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};

export const useGlobalSettings = () => {
  const { globalSettings, dispatch } = useContext(GlobalSettingsContext);

  return {
    globalSettings: globalSettings.globalSettings,
    setGlobalSettings: (payload) => dispatch({ type: 'setGlobalSettings', payload })
  };
};
