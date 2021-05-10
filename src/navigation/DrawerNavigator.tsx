import { createDrawerNavigator } from '@react-navigation/drawer';
import _isEmpty from 'lodash/isEmpty';
import _reduce from 'lodash/reduce';
import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet } from 'react-native';

import { RegularText } from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors, device, texts } from '../config';
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

const useDrawerRoutes = () => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const { data, error, loading } = useQuery(getQuery(QUERY_TYPES.PUBLIC_JSON_FILE), {
    variables: { name: 'navigation' },
    fetchPolicy
  });
  const [drawerRoutes, setDrawerRoutes] = useState(defaultDrawerRoutes);

  useEffect(() => {
    // FIXME: Nav
    let navigationPublicJsonFileContent = [];

    error && console.warn('error', error);

    try {
      const content = data?.publicJsonFile?.content;
      navigationPublicJsonFileContent = content && JSON.parse(content);
    } catch (error) {
      console.warn(error, data);
    }

    if (!_isEmpty(navigationPublicJsonFileContent)) {
      // FIXME: Nav
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

export const DrawerNavigator = ({ config }: { config: string }) => {
  const { loading, drawerRoutes } = useDrawerRoutes();

  if (loading) return <LoadingSpinner loading />;

  if (config)
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

  return <RegularText>Config is missing</RegularText>; // FIXME: Nav
};

const styles = StyleSheet.create({
  drawerContainer: {
    shadowColor: colors.darkText,
    shadowOffset: { height: 0, width: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    width: device.width > device.height ? device.height * 0.8 : device.width * 0.8
  }
});
