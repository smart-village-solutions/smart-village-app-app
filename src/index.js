import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AsyncStorage, StatusBar, StyleSheet, View } from 'react-native';
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

import { auth } from './auth';
import { colors, device, secrets, texts } from './config';
import { getQuery } from './queries';
import AppStackNavigator from './navigation/AppStackNavigator';
import { CustomDrawerContentComponent } from './navigation/CustomDrawerContentComponent';

export const MainApp = () => {
  const [client, setClient] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [drawerRoutes, setDrawerRoutes] = useState({
    AppStack: {
      screen: AppStackNavigator,
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

  const setupApolloClient = async () => {
    // https://www.apollographql.com/docs/react/recipes/authentication/#header
    const httpLink = createHttpLink({
      uri: `${secrets.serverUrl}${secrets.graphqlEndpoint}`
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

    const initialCache = {
      cacheItems: []
    };

    cache.writeData({ data: initialCache });

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

    client.onResetStore(() => cache.writeData({ data: initialCache }));

    const { data } = await client.query({
      query: getQuery('publicJsonFile'),
      variables: { name: 'navigation' },
      fetchPolicy: 'network-only'
    });

    let publicJsonFileContent =
      data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

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

    setClient(client);
    setLoaded(true);

    SplashScreen.hide();
  };

  // we can provide an empty array as second argument to the effect hook to avoid activating
  // it on component updates but only for the mounting of the component.
  // this effect depend on no variables, so it is only triggered when the component mounts.
  // if an effect depends on a variable (..., [variable]), it is triggered everytime it changes.
  // provide different effects for different contexts.
  useEffect(() => {
    auth(setupApolloClient);
  }, []);

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

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
    }
  });

  const AppContainer = createAppContainer(AppDrawerNavigator);

  return (
    <ApolloProvider client={client}>
      <StatusBar barStyle="light-content" />
      <AppContainer />
    </ApolloProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
});
