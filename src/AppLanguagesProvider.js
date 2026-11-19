import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import { useQuery } from 'react-query';

import { getMainServerConfig, getMainServerUrl } from './helpers/mainServerHelper';
import {
  getAvailableTextsLocales,
  isTextsLocale,
  synchronizeTextsLocale
} from './helpers/textsLocaleHelper';
import { NetworkContext } from './NetworkProvider';

const GERMAN_ONLY = ['de'];
const NO_NAMES = {};
export const AppLanguageNamesContext = createContext(NO_NAMES);
export const AppLanguagesContext = createContext(GERMAN_ONLY);
export const AppLanguagesLoadingContext = createContext(false);

const APP_TRANSLATION_LOCALES = gql`
  query AppTranslationLocales {
    appTranslationLocales
  }
`;

const APP_TRANSLATION_LANGUAGES = gql`
  query AppTranslationLanguages {
    appTranslationLocales
    appTranslationLanguageNames
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
  const { data, isLoading, refetch } = useQuery(
    ['appTranslationLocales', getMainServerUrl(), getMainServerConfig().oAuthClientId],
    async () => {
      let result;
      try {
        result = await client.query({ query: APP_TRANSLATION_LANGUAGES, fetchPolicy: 'no-cache' });
      } catch (error) {
        const missingNamesField = error.graphQLErrors?.some(
          ({ extensions }) =>
            extensions?.code === 'undefinedField' &&
            extensions.fieldName === 'appTranslationLanguageNames'
        );
        if (!missingNamesField) throw error;
        result = await client.query({ query: APP_TRANSLATION_LOCALES, fetchPolicy: 'no-cache' });
      }
      const locales = selectAppLanguages(result.data?.appTranslationLocales);
      const names = Object.fromEntries(
        locales
          .map((locale) => [locale, result.data?.appTranslationLanguageNames?.[locale]])
          .filter(([, name]) => typeof name === 'string' && name.trim())
      );
      return { locales, names };
    },
    {
      enabled: online,
      retry: false,
      refetchOnMount: true,
      onSuccess: ({ locales }) => {
        void synchronizeTextsLocale(client, locales).catch(() => {
          console.warn('Unable to synchronize the text locale');
        });
      }
    }
  );

  useEffect(() => {
    if (!online) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refetch();
      }
    });
    return () => subscription.remove();
  }, [online, refetch]);

  return (
    <AppLanguagesContext.Provider value={data?.locales ?? getAvailableTextsLocales()}>
      <AppLanguageNamesContext.Provider value={data?.names ?? NO_NAMES}>
        <AppLanguagesLoadingContext.Provider value={isLoading}>
          {children}
        </AppLanguagesLoadingContext.Provider>
      </AppLanguageNamesContext.Provider>
    </AppLanguagesContext.Provider>
  );
};

AppLanguagesProvider.propTypes = {
  client: PropTypes.shape({ query: PropTypes.func.isRequired }).isRequired,
  children: PropTypes.node.isRequired
};
