import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import { useQuery } from 'react-query';

import { getMainServerConfig, getMainServerUrl } from './helpers/mainServerHelper';
import {
  getTextsLocale,
  isTextsLocale,
  saveTextsLocaleAndReload
} from './helpers/textsLocaleHelper';
import { NetworkContext } from './NetworkProvider';

const GERMAN_ONLY = ['de'];
export const AppLanguagesContext = createContext(GERMAN_ONLY);

const APP_TRANSLATION_LOCALES = gql`
  query AppTranslationLocales {
    appTranslationLocales
  }
`;

const selectAppLanguages = (locales) => {
  if (!Array.isArray(locales) || locales.some((locale) => !isTextsLocale(locale))) {
    throw new Error('Invalid Mainserver language list');
  }
  return [...new Set(['de', ...locales])];
};

export const AppLanguagesProvider = ({ client, children }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const online = !!(isConnected && isMainserverUp);
  const { data, refetch } = useQuery(
    ['appTranslationLocales', getMainServerUrl(), getMainServerConfig().oAuthClientId],
    async () => {
      const result = await client.query({
        query: APP_TRANSLATION_LOCALES,
        fetchPolicy: 'no-cache'
      });
      return selectAppLanguages(result.data?.appTranslationLocales);
    },
    {
      enabled: online,
      retry: false,
      refetchOnMount: true,
      refetchInterval: 60000,
      onSuccess: (locales) => {
        if (!locales.includes(getTextsLocale())) {
          void saveTextsLocaleAndReload('de').catch(() => {
            console.warn('Unable to apply the German fallback locale');
          });
        }
      }
    }
  );

  useEffect(() => {
    if (!online) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refetch();
    });
    return () => subscription.remove();
  }, [online, refetch]);

  return (
    <AppLanguagesContext.Provider value={data || GERMAN_ONLY}>
      {children}
    </AppLanguagesContext.Provider>
  );
};

AppLanguagesProvider.propTypes = {
  client: PropTypes.shape({ query: PropTypes.func.isRequired }).isRequired,
  children: PropTypes.node.isRequired
};
