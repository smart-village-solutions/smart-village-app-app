import AsyncStorage from '@react-native-async-storage/async-storage';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { createHttpLink } from 'apollo-link-http';
import * as SecureStore from 'expo-secure-store';
import _isEmpty from 'lodash/isEmpty';
import React, { useContext, useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import appJson from '../app.json';

import { AccessibilityProvider } from './AccessibilityProvider';
import { auth } from './auth';
import { BookmarkProvider } from './BookmarkProvider';
import { LoadingContainer } from './components';
import { colors, consts, namespace, secrets } from './config';
import { ConfigurationsProvider } from './ConfigurationsProvider';
import {
  geoLocationToLocationObject,
  graphqlFetchPolicy,
  parsedImageAspectRatio,
  PROFILE_AUTH_TOKEN,
  storageHelper
} from './helpers';
import { Navigator } from './navigation/Navigator';
import { NetworkContext, NetworkProvider } from './NetworkProvider';
import { OnboardingManager } from './OnboardingManager';
import { OrientationProvider } from './OrientationProvider';
import { PermanentFilterProvider } from './PermanentFilterProvider';
import { ProfileProvider } from './ProfileProvider';
import { getQuery, QUERY_TYPES } from './queries';
import { ReactQueryProvider } from './ReactQueryProvider';
import { SettingsProvider } from './SettingsProvider';
import { UnreadMessagesProvider } from './UnreadMessagesProvider';

const { LIST_TYPES } = consts;

const MainAppWithApolloProvider = () => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState();
  const [initialGlobalSettings, setInitialGlobalSettings] = useState({
    filter: {},
    hdvt: {},
    navigation: 'tab',
    sections: {},
    settings: {},
    widgets: []
  });
  const [initialListTypesSettings, setInitialListTypesSettings] = useState({});
  const [initialLocationSettings, setInitialLocationSettings] = useState({});
  const [initialConversationSettings, setInitialConversationSettings] = useState({});
  const [authRetried, setAuthRetried] = useState(false);

  const setupApolloClient = async () => {
    // https://www.apollographql.com/docs/react/recipes/authentication/#header
    const httpLink = createHttpLink({
      uri: `${secrets[namespace].serverUrl}${secrets[namespace].graphqlEndpoint}`
    });
    const authLink = setContext(async (_, { headers }) => {
      // get the authentication token from local SecureStore if it exists
      const accessToken = await SecureStore.getItemAsync('ACCESS_TOKEN');
      const authToken = await SecureStore.getItemAsync(PROFILE_AUTH_TOKEN);

      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          authorization: accessToken ? `Bearer ${accessToken}` : '',
          'X-Authorization': authToken || ''
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

    return client;
  };

  // we wait for NetInfo to check for main server reachability, which is made when `isMainserverUp`
  // becomes `true` or `false` and is not `null` anymore.
  useEffect(() => {
    // setup the apollo client if NetInfo finished and if there is no client existing already
    isMainserverUp !== null && !client && auth(setupApolloClient);
  }, [isMainserverUp]);

  const setupInitialGlobalSettings = async ({ client }) => {
    const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

    // rehydrate data from the async storage to the global state
    let globalSettings = (await storageHelper.globalSettings()) || initialGlobalSettings;

    // if there are no list type settings yet, set the defaults as fallback
    const listTypesSettings = (await storageHelper.listTypesSettings()) || {
      [QUERY_TYPES.NEWS_ITEMS]: LIST_TYPES.CARD_TEXT_LIST,
      [QUERY_TYPES.EVENT_RECORDS]: LIST_TYPES.TEXT_LIST,
      [QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS]: LIST_TYPES.TEXT_LIST,
      [QUERY_TYPES.STATIC_CONTENT_LIST]: LIST_TYPES.CARD_LIST
    };

    let globalSettingsData;

    try {
      const response = await client.query({
        query: getQuery(QUERY_TYPES.PUBLIC_JSON_FILE),
        variables: { name: 'globalSettings', version: appJson.expo.version },
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

    const globalSettingsPublicJsonFileContent = globalSettingsData?.publicJsonFile?.content;

    if (!_isEmpty(globalSettingsPublicJsonFileContent)) {
      globalSettings = globalSettingsPublicJsonFileContent;
      storageHelper.setGlobalSettings(globalSettings);
    }

    // if there are no locationSettings yet, set the defaults as fallback
    const locationSettings = !globalSettings?.settings?.locationService
      ? { locationService: false }
      : (await storageHelper.locationSettings()) || {};

    const defaultAlternativePosition =
      globalSettings?.settings?.locationService?.defaultAlternativePosition;

    if (defaultAlternativePosition) {
      locationSettings.defaultAlternativePosition = geoLocationToLocationObject(
        defaultAlternativePosition
      );
    }

    setInitialLocationSettings(locationSettings);
    setInitialListTypesSettings(listTypesSettings);
    setInitialGlobalSettings(globalSettings);
    setInitialConversationSettings((await storageHelper.conversationSettings()) || {});

    // this is currently the last point where something was done, so the app startup is done
    setLoading(false);
  };

  // setup the apollo client and setup global settings after apollo client setup finished
  useEffect(() => {
    async function prepare() {
      try {
        await auth();

        const client = await setupApolloClient();

        setupInitialGlobalSettings({ client });
      } catch (error) {
        console.warn(error);
      }
    }

    !!isMainserverUp && prepare();
  }, [isMainserverUp]);

  if (loading || !client) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  if (initialGlobalSettings.imageAspectRatio) {
    consts.IMAGE_ASPECT_RATIO = parsedImageAspectRatio(initialGlobalSettings.imageAspectRatio);
  }

  return (
    <ApolloProvider client={client}>
      <SettingsProvider
        {...{
          initialGlobalSettings,
          initialListTypesSettings,
          initialLocationSettings,
          initialConversationSettings
        }}
      >
        <ConfigurationsProvider>
          <OnboardingManager>
            <ProfileProvider>
              <UnreadMessagesProvider>
                <Navigator navigationType={initialGlobalSettings.navigation} />
              </UnreadMessagesProvider>
            </ProfileProvider>
          </OnboardingManager>
        </ConfigurationsProvider>
      </SettingsProvider>
    </ApolloProvider>
  );
};

export const MainApp = () => (
  <NetworkProvider>
    <OrientationProvider>
      <BookmarkProvider>
        <PermanentFilterProvider>
          <ReactQueryProvider>
            <SafeAreaProvider>
              <AccessibilityProvider>
                <MainAppWithApolloProvider />
              </AccessibilityProvider>
            </SafeAreaProvider>
          </ReactQueryProvider>
        </PermanentFilterProvider>
      </BookmarkProvider>
    </OrientationProvider>
  </NetworkProvider>
);
