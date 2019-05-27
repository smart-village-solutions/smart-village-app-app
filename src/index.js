import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AsyncStorage, StatusBar, StyleSheet, View } from 'react-native';
import { createAppContainer, createDrawerNavigator } from 'react-navigation';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import _reduce from 'lodash/reduce';

import { colors, device, texts } from './config';
import { GET_PUBLIC_JSON_FILE } from './queries';
import {
  HomeStackNavigator,
  HtmlStackNavigator,
  IndexStackNavigator
} from './navigation/stackNavigators';
import { CustomDrawerContentComponent } from './navigation/CustomDrawerContentComponent';

export const App = () => {
  const [client, setClient] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [drawerRoutes, setDrawerRoutes] = useState({
    HomeStack: {
      screen: HomeStackNavigator,
      navigationOptions: () => ({
        title: texts.screenTitles.home
      })
    }
  });

  const setupApolloClient = async () => {
    const link = new HttpLink({ uri: 'http://192.168.1.36:3000/graphql' });
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
      query: GET_PUBLIC_JSON_FILE,
      variables: { name: 'navigation' },
      fetchPolicy: 'network-only'
    });

    let publicJsonFileContent =
      data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

    if (publicJsonFileContent) {
      const getScreen = (drawerRoute) => {
        switch (drawerRoute.screen) {
        case 'IndexStackNavigator':
          return IndexStackNavigator;
        case 'HtmlStackNavigator':
          return HtmlStackNavigator;
        default:
          return drawerRoute.screen;
        }
      };

      setDrawerRoutes(
        _reduce(
          publicJsonFileContent,
          (result, value, key) => {
            result[key] = {
              screen: getScreen(value),
              navigationOptions: () => ({
                title: value.title
              }),
              params: { ...value }
            };

            return result;
          },
          drawerRoutes
        )
      );
    }

    setClient(client);
    setLoaded(true);
  };

  // we can provide an empty array as second argument to the effect hook to avoid activating
  // it on component updates but only for the mounting of the component.
  // this effect depend on no variables, so it is only triggered when the component mounts.
  // if an effect depends on a variable (..., [variable]), it is triggered everytime it changes.
  // provide different effects for different contexts.
  useEffect(() => {
    setupApolloClient();
  }, []);

  if (!loaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  const AppDrawerNavigator = createDrawerNavigator(drawerRoutes, {
    initialRouteName: 'HomeStack',
    drawerPosition: 'right',
    drawerType: device.platform === 'ios' ? 'slide' : 'front',
    drawerWidth: device.width * 0.8,
    // workaround with minus value for android until new version of react-native-gesture-handler is
    // included: https://github.com/react-navigation/drawer/issues/49
    edgeWidth: device.platform === 'android' ? 20 - device.width * 0.8 : 20,
    contentComponent: (props) => CustomDrawerContentComponent(props),
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
