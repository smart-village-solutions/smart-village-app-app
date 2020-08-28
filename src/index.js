import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AsyncStorage, StatusBar } from 'react-native';
import { SplashScreen } from 'expo';
import * as SecureStore from 'expo-secure-store';
import { createAppContainer, createDrawerNavigator } from 'react-navigation';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import _reduce from 'lodash/reduce';

import appJson from '../app.json';
import { auth } from './auth';
import { colors, consts, device, secrets, texts } from './config';
import { netInfoForGraphqlFetchPolicy, storageHelper } from './helpers';
import { getQuery } from './queries';
import { NetworkProvider } from './NetworkProvider';
import { GlobalSettingsProvider } from './GlobalSettingsProvider';
import AppStackNavigator from './navigation/AppStackNavigator';
import MainTabNavigator from './navigation/MainTabNavigator';
import { CustomDrawerContentComponent } from './navigation/CustomDrawerContentComponent';
import { LoadingContainer } from './components';

const MainAppWithApolloProvider = () => {
  const [client, setClient] = useState(null);
  const [globalSettingsState, setGlobalSettingsState] = useState({});
  const [drawerRoutes, setDrawerRoutes] = useState({
    AppStack: {
      screen: AppStackNavigator(),
      navigationOptions: () => ({
        title: texts.navigationTitles.home
      }),
      params: {
        title: texts.screenTitles.home,
        screen: 'Home',
        query: '',
        queryVariables: {},
        rootRouteName: 'AppStack'
      }
    }
  });
  const [authRetried, setAuthRetried] = useState(false);

  /* eslint-disable complexity */
  /* NOTE: we need to check a lot for presence, so this is that complex */
  const setupApolloClient = async () => {
    const namespace = appJson.expo.slug;

    // https://www.apollographql.com/docs/react/recipes/authentication/#header
    const httpLink = createHttpLink({
      uri: `${secrets[namespace].serverUrl}${secrets[namespace].graphqlEndpoint}`
    });
    const authLink = setContext(async (_, { headers }) => {
      // get the authentication token from local SecureStore if it exists
      const accessToken = await SecureStore.getItemAsync('ACCESS_TOKEN');

      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          authorization: accessToken ? `Bearer ${accessToken}` : ''
        }
      };
    });
    const link = authLink.concat(httpLink);
    const cache = new InMemoryCache();
    const storage = AsyncStorage;

    try {
      // await before instantiating ApolloClient,
      // else queries might run before the cache is persisted
      await persistCache({
        cache,
        storage
      });
    } catch (error) {
      console.error('Error restoring Apollo cache', error);
    }

    // Setup your Apollo Link, and any other Apollo packages here.
    const client = new ApolloClient({
      link,
      cache,

      // From the docs: https://www.apollographql.com/docs/react/essentials/local-state#client-fields-cache
      // If you want to use Apollo Client's @client support to query the cache without using
      // local resolvers, you must pass an empty object into the ApolloClient constructor
      // resolvers option. Without this Apollo Client will not enable its integrated @client
      // support, which means your @client based queries will be passed to the Apollo Client
      // link chain. You can find more details about why this is necessary here
      // (https://github.com/apollographql/apollo-client/pull/4499).
      resolvers: {}
    });

    const fetchPolicy = await netInfoForGraphqlFetchPolicy();
    let navigationData;
    let globalSettingsData;

    // rehydrate data from the async storage to the global state
    let globalSettings = await storageHelper.globalSettings();

    if (!globalSettings) {
      // if there are no global settings yet, add a navigation fallback
      globalSettings = {
        navigation: consts.DRAWER
      };
    }

    try {
      const response = await client.query({
        query: getQuery('publicJsonFile'),
        variables: { name: 'globalSettings' },
        fetchPolicy
      });

      globalSettingsData = response.data;
    } catch (error) {
      console.warn('error', error);

      if (error.message.includes('Network error')) {
        // try once to authenticate with forcing a fresh token request
        !authRetried && auth(setupApolloClient, true);
        // set flag `true` to prevent endless loops
        setAuthRetried(true);
      }
    }

    const globalSettingsPublicJsonFileContent =
      globalSettingsData &&
      globalSettingsData.publicJsonFile &&
      JSON.parse(globalSettingsData.publicJsonFile.content);

    if (globalSettingsPublicJsonFileContent) {
      globalSettings = globalSettingsPublicJsonFileContent;
      storageHelper.setGlobalSettings(globalSettings);
    }

    setGlobalSettingsState({
      ...globalSettingsState,
      ...globalSettings
    });

    if (globalSettings.navigation === consts.DRAWER) {
      // setup drawer routes for navigation
      try {
        const response = await client.query({
          query: getQuery('publicJsonFile'),
          variables: { name: 'navigation' },
          fetchPolicy
        });

        navigationData = response.data;
      } catch (errors) {
        console.warn('errors', errors);
      }

      let publicJsonFileContent =
        navigationData &&
        navigationData.publicJsonFile &&
        JSON.parse(navigationData.publicJsonFile.content);

      if (publicJsonFileContent) {
        setDrawerRoutes(
          _reduce(
            publicJsonFileContent,
            (result, value, key) => {
              result[key] = {
                screen: value.screen,
                navigationOptions: () => ({
                  title: value.title
                }),
                params: { ...value, rootRouteName: key }
              };

              return result;
            },
            drawerRoutes
          )
        );
      }
    }

    setClient(client);

    SplashScreen.hide();
  };
  /* eslint-enable complexity */

  // we can provide an empty array as second argument to the effect hook to avoid activating
  // it on component updates but only for the mounting of the component.
  // this effect depend on no variables, so it is only triggered when the component mounts.
  // if an effect depends on a variable (..., [variable]), it is triggered everytime it changes.
  // provide different effects for different contexts.
  useEffect(() => {
    auth(setupApolloClient);
  }, []);

  if (!client) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  let AppContainer = () => null;

  if (globalSettingsState.navigation === consts.DRAWER) {
    // use drawer for navigation for the app
    const AppDrawerNavigator = createDrawerNavigator(drawerRoutes, {
      initialRouteName: 'AppStack',
      drawerPosition: 'right',
      drawerType: device.platform === 'ios' ? 'slide' : 'front',
      drawerWidth: device.width * 0.8,
      contentComponent: CustomDrawerContentComponent,
      contentContainerStyle: {
        shadowColor: colors.darkText,
        shadowOffset: { height: 0, width: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3
      },
      overlayColor: colors.overlayRgba
    });

    AppContainer = createAppContainer(AppDrawerNavigator);
  }

  if (globalSettingsState.navigation === consts.TABS) {
    AppContainer = createAppContainer(MainTabNavigator);
  }

  return (
    <ApolloProvider client={client}>
      <GlobalSettingsProvider globalSettings={globalSettingsState}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <AppContainer />
      </GlobalSettingsProvider>
    </ApolloProvider>
  );
};

export const MainApp = () => (
  <NetworkProvider>
    <MainAppWithApolloProvider />
  </NetworkProvider>
);
