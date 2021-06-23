import { createDrawerNavigator } from '@react-navigation/drawer';
import _isEmpty from 'lodash/isEmpty';
import _reduce from 'lodash/reduce';
import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet } from 'react-native';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { device, texts } from '../config';
import { graphqlFetchPolicy } from '../helpers';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';

import { AppStackNavigator } from './AppStackNavigator';
import { CustomDrawerContentComponent } from './CustomDrawerContentComponent';

const defaultDrawerRoutes = {
  AppStack: {
    screen: 'Home',
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
};

type DrawerRoutes = Record<
  string,
  {
    screen: string;
    navigationOptions: () => Record<string, any>;
    params: Record<string, any>;
  }
>;

const useDrawerRoutes = () => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const { data, error, loading } = useQuery(getQuery(QUERY_TYPES.PUBLIC_JSON_FILE), {
    variables: { name: 'navigation' },
    fetchPolicy
  });
  const [drawerRoutes, setDrawerRoutes] = useState<DrawerRoutes>(defaultDrawerRoutes);

  useEffect(() => {
    let navigationPublicJsonFileContent: Array<Record<string, any>> = [];

    error && console.warn('error', error);

    try {
      const content = data?.publicJsonFile?.content;
      navigationPublicJsonFileContent = content && JSON.parse(content);
    } catch (error) {
      console.warn(error, data);
    }

    if (!_isEmpty(navigationPublicJsonFileContent)) {
      setDrawerRoutes((currentRoutes) =>
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
          { ...currentRoutes }
        )
      );
    }
  }, [data, error]);

  return { loading, drawerRoutes };
};

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  const { loading, drawerRoutes } = useDrawerRoutes();

  if (loading) return <LoadingSpinner loading />;

  return (
    <Drawer.Navigator
      drawerContent={({ navigation, state }) => (
        <CustomDrawerContentComponent
          navigation={navigation}
          state={state}
          drawerRoutes={drawerRoutes}
        />
      )}
      drawerPosition="right"
      drawerStyle={styles.drawerContainer}
      drawerType={device.platform === 'ios' ? 'slide' : 'front'}
      initialRouteName="AppStack"
    >
      <Drawer.Screen name="AppStack" component={AppStackNavigator} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    width: device.width > device.height ? device.height * 0.8 : device.width * 0.8
  }
});
