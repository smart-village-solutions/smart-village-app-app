import AsyncStorage from '@react-native-async-storage/async-storage';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { createHttpLink } from 'apollo-link-http';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import _isEmpty from 'lodash/isEmpty';
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { auth } from './auth';
import { BookmarkProvider } from './BookmarkProvider';
import { LoadingContainer } from './components';
import { colors, consts, namespace, secrets } from './config';
import { graphqlFetchPolicy, parsedImageAspectRatio, storageHelper } from './helpers';
import { Navigator } from './navigation/Navigator';
import NetInfo from './NetInfo';
import { NetworkProvider } from './NetworkProvider';
import { OrientationProvider } from './OrientationProvider';
import { getQuery, QUERY_TYPES } from './queries';
import { SettingsProvider } from './SettingsProvider';

const { LIST_TYPES } = consts;

const MainAppWithApolloProvider = () => {
  const [loading, setLoading] = useState(true);
  const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true);
  const [client, setClient] = useState();
  const [initialGlobalSettings, setInitialGlobalSettings] = useState({});
  const [initialListTypesSettings, setInitialListTypesSettings] = useState({});
  const [authRetried, setAuthRetried] = useState(false);
  const [netInfo, setNetInfo] = useState({
    isConnected: null,
    isMainserverUp: null,
    netInfoCounter: 0
  });
  const { isConnected, isMainserverUp, netInfoCounter } = netInfo;

  const setupApolloClient = async () => {
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
    // Note: httpLink is terminating so must be last, while retry & error wrap the links to their right
    //       state & context links should happen before (to the left of) restLink.
    //       https://www.apollographql.com/docs/link/links/rest/#link-order
    // const link = ApolloLink.from([authLink, restLink, errorLink, retryLink, httpLink]);
    const link = ApolloLink.from([authLink, httpLink]);
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

  const setupInitialGlobalSettings = async () => {
    const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

    // rehydrate data from the async storage to the global state
    // if there are no general settings yet, add a navigation fallback
    let globalSettings = await storageHelper.globalSettings();

    // if there are no list type settings yet, set the defaults as fallback
    const listTypesSettings = (await storageHelper.listTypesSettings()) || {
      [QUERY_TYPES.NEWS_ITEMS]: LIST_TYPES.TEXT_LIST,
      [QUERY_TYPES.EVENT_RECORDS]: LIST_TYPES.TEXT_LIST,
      [QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS]: LIST_TYPES.CARD_LIST
    };

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

    let globalSettingsPublicJsonFileContent = [];

    try {
      globalSettingsPublicJsonFileContent = JSON.parse(globalSettingsData?.publicJsonFile?.content);
    } catch (error) {
      console.warn(error, globalSettingsData);
    }

    if (!_isEmpty(globalSettingsPublicJsonFileContent)) {
      globalSettings = globalSettingsPublicJsonFileContent;
      storageHelper.setGlobalSettings(globalSettings);
    }

    setInitialGlobalSettings(globalSettings);
    setInitialListTypesSettings(listTypesSettings);
  };

  // setup global settings if apollo client setup finished
  useEffect(() => {
    client && setupInitialGlobalSettings();
  }, [client]);

  useEffect(() => {
    // this is currently the last point where something was done, so the app startup is done
    initialGlobalSettings && client && setLoading(false);
  }, [initialGlobalSettings]);

  useEffect(() => {
    !loading &&
      SplashScreen.hideAsync().then(() => {
        setIsSplashScreenVisible(false);
        // set orientation to "default", to allow both portrait and landscape
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
      });
  }, [loading]);

  if (loading || isSplashScreenVisible) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  if (initialGlobalSettings.imageAspectRatio) {
    consts.IMAGE_ASPECT_RATIO = parsedImageAspectRatio(initialGlobalSettings.imageAspectRatio);
  }

  return (
    <ApolloProvider client={client}>
      <SettingsProvider {...{ initialGlobalSettings, initialListTypesSettings }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <Navigator />
      </SettingsProvider>
    </ApolloProvider>
  );
};

export const MainApp = () => (
  <NetworkProvider>
    <OrientationProvider>
      <BookmarkProvider>
        <SafeAreaProvider>
          <MainAppWithApolloProvider />
        </SafeAreaProvider>
      </BookmarkProvider>
    </OrientationProvider>
  </NetworkProvider>
);
