import { createDrawerNavigator } from '@react-navigation/drawer';
import _isEmpty from 'lodash/isEmpty';
import _reduce from 'lodash/reduce';
import React, { useContext, useEffect, useState } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { device, texts } from '../config';
import { defaultStackConfig } from '../config/navigation';
import { useStaticContent } from '../hooks';
import { OrientationContext } from '../OrientationProvider';
import { ScreenName } from '../types';

import { getStackNavigator } from './AppStackNavigator';
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
  const { data, error, loading } = useStaticContent<Array<Record<string, any>>>({
    name: 'navigation',
    type: 'json'
  });

  const [drawerRoutes, setDrawerRoutes] = useState<DrawerRoutes>(defaultDrawerRoutes);

  useEffect(() => {
    error && console.warn('error', error);

    if (!_isEmpty(data)) {
      setDrawerRoutes((currentRoutes) =>
        _reduce(
          data,
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

const AppStackNavigator = getStackNavigator(
  defaultStackConfig({
    initialRouteName: ScreenName.Home,
    isDrawer: true
  })
);

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  const { loading, drawerRoutes } = useDrawerRoutes();
  const { orientation } = useContext(OrientationContext);

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
      screenOptions={{
        drawerPosition: 'right',
        drawerStyle: {
          width: orientation === 'landscape' ? device.height * 0.8 : device.width * 0.8
        },
        headerShown: false
      }}
      initialRouteName="AppStack"
    >
      <Drawer.Screen name="AppStack" component={AppStackNavigator} />
    </Drawer.Navigator>
  );
};
