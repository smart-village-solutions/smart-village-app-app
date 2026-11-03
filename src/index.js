import AsyncStorage from '@react-native-async-storage/async-storage';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { createHttpLink } from 'apollo-link-http';
import _isEmpty from 'lodash/isEmpty';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import appJson from '../app.json';

import { AccessibilityProvider } from './AccessibilityProvider';
import { auth } from './auth';
import { BookmarkProvider } from './BookmarkProvider';
import { consts, namespace, secrets } from './config';
import { ConfigurationsProvider } from './ConfigurationsProvider';
import {
  createEndOfDayExpiringStorage,
  geoLocationToLocationObject,
  graphqlFetchPolicy,
  parsedImageAspectRatio,
  storageHelper
} from './helpers';
import { AUTH_MODE_PUBLIC, getGraphqlAuthHeaders } from './graphqlAuth';
import { queryWithAuthRetry } from './helpers/queryWithAuthRetry';
import { IconProvider } from './IconProvider';
import { Navigator } from './navigation/Navigator';
import { NetworkContext, NetworkProvider } from './NetworkProvider';
import { OnboardingManager } from './OnboardingManager';
import { OrientationProvider } from './OrientationProvider';
import { PermanentFilterProvider } from './PermanentFilterProvider';
import { ProfileProvider } from './ProfileProvider';
import { getQuery, QUERY_TYPES } from './queries';
import { ReactQueryCacheSettings, ReactQueryProvider } from './ReactQueryProvider';
import { initialContext, SettingsContext, SettingsProvider } from './SettingsProvider';
import { AppThemeProvider } from './ThemeProvider';
import { UnreadMessagesProvider } from './UnreadMessagesProvider';
import { WasteReminderRuntime } from './WasteReminderRuntime';
import { OtaUpdateManager, VolunteerReportProvider } from './components';

const { LIST_TYPES } = consts;

const applyImageAspectRatio = (imageAspectRatio) => {
  if (imageAspectRatio) {
    consts.IMAGE_ASPECT_RATIO = parsedImageAspectRatio(imageAspectRatio);
  }
};

const MainAppWithSettings = () => {
  const { globalSettings } = useContext(SettingsContext);

  return (
    <IconProvider>
      <ReactQueryCacheSettings globalSettings={globalSettings} />
      <AccessibilityProvider>
        <AppThemeProvider>
          <ConfigurationsProvider>
            <OnboardingManager>
              <ProfileProvider>
                <UnreadMessagesProvider>
                  <OtaUpdateManager />
                  <WasteReminderRuntime />
                  <VolunteerReportProvider>
                    <Navigator navigationType={globalSettings.navigation} />
                  </VolunteerReportProvider>
                </UnreadMessagesProvider>
              </ProfileProvider>
            </OnboardingManager>
          </ConfigurationsProvider>
        </AppThemeProvider>
      </AccessibilityProvider>
    </IconProvider>
  );
};

const MainAppWithApolloProvider = () => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState();
  const bootstrap = useRef({ client: undefined, pending: false, complete: false });
  const [initialGlobalSettings, setInitialGlobalSettings] = useState(initialContext.globalSettings);
  const [initialListTypesSettings, setInitialListTypesSettings] = useState({});
  const [initialLocationSettings, setInitialLocationSettings] = useState({});
  const [initialConversationSettings, setInitialConversationSettings] = useState({});

  const setupApolloClient = async () => {
    // https://www.apollographql.com/docs/react/recipes/authentication/#header
    const httpLink = createHttpLink({
      uri: `${secrets[namespace].serverUrl}${secrets[namespace].graphqlEndpoint}`
    });
    const authLink = setContext(async (operation, previousContext = {}) => {
      const authMode = previousContext?.authMode ?? AUTH_MODE_PUBLIC;
      const authHeaders = await getGraphqlAuthHeaders(authMode);

      return {
        headers: {
          ...previousContext?.headers,
          ...authHeaders
        }
      };
    });
    // Note: httpLink is terminating so must be last, while retry & error wrap the links to their right
    //       state & context links should happen before (to the left of) restLink.
    //       https://www.apollographql.com/docs/link/links/rest/#link-order
    // const link = ApolloLink.from([authLink, restLink, errorLink, retryLink, httpLink]);
    const link = ApolloLink.from([authLink, httpLink]);
    const cache = new InMemoryCache();
    const storage = createEndOfDayExpiringStorage(AsyncStorage, {
      getGlobalSettings: storageHelper.globalSettings
    });

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

  const setupInitialGlobalSettings = async ({ client }) => {
    const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

    // rehydrate data from the async storage to the global state
    let globalSettings = (await storageHelper.globalSettings()) || initialGlobalSettings;

    // if there are no list type settings yet, set the defaults as fallback
    const listTypesSettings = (await storageHelper.listTypesSettings()) || {
      [QUERY_TYPES.NEWS_ITEMS]: LIST_TYPES.TEXT_LIST,
      [QUERY_TYPES.EVENT_RECORDS]: LIST_TYPES.TEXT_LIST,
      [QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS]: LIST_TYPES.CARD_LIST,
      [QUERY_TYPES.SEARCH]: LIST_TYPES.GROUPED_LIST,
      [QUERY_TYPES.STATIC_CONTENT_LIST]: LIST_TYPES.CARD_LIST,
      [QUERY_TYPES.WASTE_STREET]: LIST_TYPES.GROUPED_LIST
    };

    let globalSettingsData;

    try {
      const response = await queryWithAuthRetry(
        () =>
          client.query({
            query: getQuery(QUERY_TYPES.PUBLIC_JSON_FILE),
            variables: { name: 'globalSettings', version: appJson.expo.version },
            fetchPolicy
          }),
        () => auth(undefined, true)
      );

      globalSettingsData = response.data;
    } catch (error) {
      // Keep cached settings on transport/parse failures; do not refresh valid credentials.
      console.warn('Unable to refresh global settings', error);
    }

    const globalSettingsPublicJsonFileContent = globalSettingsData?.publicJsonFile?.content;

    if (!_isEmpty(globalSettingsPublicJsonFileContent)) {
      globalSettings = {
        ...globalSettings,
        ...globalSettingsPublicJsonFileContent
      };
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
    applyImageAspectRatio(globalSettings.imageAspectRatio);
    setInitialGlobalSettings(globalSettings);
    setInitialConversationSettings((await storageHelper.conversationSettings()) || {});
  };

  // Bootstrap once; reconnects must not replace the live cache or reset user settings.
  useEffect(() => {
    const state = bootstrap.current;
    if (isMainserverUp === null || state.pending) return;

    if (state.complete) {
      if (isMainserverUp) {
        void auth().catch((error) => console.warn('Unable to refresh app authentication', error));
      }
      return;
    }

    state.pending = true;
    async function prepare() {
      try {
        if (isMainserverUp) {
          try {
            await auth();
          } catch (error) {
            console.warn('Unable to refresh app authentication', error);
          }
        }

        // Reuse the client if settings hydration failed and bootstrap is retried.
        if (!state.client) state.client = await setupApolloClient();
        await setupInitialGlobalSettings({ client: state.client });
        state.complete = true;
        setLoading(false);
      } catch (error) {
        console.warn(error);
      } finally {
        state.pending = false;
      }
    }

    void prepare();
  }, [isMainserverUp, loading]);

  if (loading || !client) return null;

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
        <MainAppWithSettings />
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
              <MainAppWithApolloProvider />
            </SafeAreaProvider>
          </ReactQueryProvider>
        </PermanentFilterProvider>
      </BookmarkProvider>
    </OrientationProvider>
  </NetworkProvider>
);
