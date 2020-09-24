import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AsyncStorage, StatusBar } from 'react-native';
import { SplashScreen } from 'expo';
import * as SecureStore from 'expo-secure-store';
import * as ScreenOrientation from 'expo-screen-orientation';
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
import { graphqlFetchPolicy, storageHelper } from './helpers';
import { getQuery, QUERY_TYPES } from './queries';
import { NetworkProvider } from './NetworkProvider';
import NetInfo from './NetInfo';
import { OrientationProvider } from './OrientationProvider';
import { GlobalSettingsProvider } from './GlobalSettingsProvider';
import AppStackNavigator from './navigation/AppStackNavigator';
import MainTabNavigator from './navigation/MainTabNavigator';
import { CustomDrawerContentComponent } from './navigation/CustomDrawerContentComponent';
import { LoadingContainer } from './components';

const MainAppWithApolloProvider = () => {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState();
  const [globalSettingsState, setGlobalSettingsState] = useState();
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
  const [netInfo, setNetInfo] = useState({
    isConnected: null,
    isMainserverUp: null,
    netInfoCounter: 0
  });
  const { isConnected, isMainserverUp, netInfoCounter } = netInfo;

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

    setClient(client);
  };

  // we can provide an empty array as second argument to the effect hook to avoid activating
  // it on component updates but only for the mounting of the component.
  // this effect depend on no variables, so it is only triggered when the component mounts.
  // if an effect depends on a variable (..., [variable]), it is triggered every time it changes.
  // provide different effects for different contexts.
  //
  // we wait for NetInfo to check for main server reachability, which is made when `isMainserverUp`
  // becomes `true` or `false` and is not `null` anymore. with the `netInfoCounter` that gets
  // updated every time the main server was not checked for reachability, we trigger the the
  // effect again until NetInfo has finished.
  useEffect(() => {
    const updateNetInfo = async () => {
      const updatedNetInfo = await NetInfo.fetch();

      setNetInfo({
        isConnected: updatedNetInfo.isConnected,
        isMainserverUp: updatedNetInfo.isInternetReachable,
        netInfoCounter: updatedNetInfo.isInternetReachable === null && netInfoCounter + 1
      });
    };

    // re-run NetInfo
    isMainserverUp === null && updateNetInfo();

    // setup the apollo client if NetInfo finished and if there is no client existing already
    isMainserverUp !== null && !client && auth(setupApolloClient);
  }, [netInfoCounter]);

  const setupGlobalSettings = async () => {
    const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

    // rehydrate data from the async storage to the global state
    let globalSettings = await storageHelper.globalSettings();

    if (!globalSettings) {
      // if there are no global settings yet, add a navigation fallback
      globalSettings = {
        navigation: consts.DRAWER
      };
    }

    let globalSettingsData;

    try {
      const response = await client.query({
        query: getQuery(QUERY_TYPES.PUBLIC_JSON_FILE),
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

    setGlobalSettingsState(globalSettings);
  };

  useEffect(() => {
    client && setupGlobalSettings();
  }, [client]);

  const setupNavigationDrawer = async () => {
    if (globalSettingsState.navigation === consts.DRAWER) {
      const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
      let navigationData;

      // setup drawer routes for navigation
      try {
        const response = await client.query({
          query: getQuery(QUERY_TYPES.PUBLIC_JSON_FILE),
          variables: { name: 'navigation' },
          fetchPolicy
        });

        navigationData = response.data;
      } catch (errors) {
        console.warn('errors', errors);
      }

      let navigationPublicJsonFileContent =
        navigationData &&
        navigationData.publicJsonFile &&
        JSON.parse(navigationData.publicJsonFile.content);

      if (navigationPublicJsonFileContent) {
        setDrawerRoutes(
          _reduce(
            navigationPublicJsonFileContent,
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

    // this is currently the last point where something was done, so the app startup is done
    setLoading(false);
  };

  useEffect(() => {
    globalSettingsState && client && setupNavigationDrawer();
  }, [globalSettingsState]);

  useEffect(() => {
    !loading && SplashScreen.hide();

    // set orientation to "default", to allow both portrait and landscape
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
  }, [loading]);

  if (loading) {
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
    <OrientationProvider>
      <MainAppWithApolloProvider />
    </OrientationProvider>
  </NetworkProvider>
);
